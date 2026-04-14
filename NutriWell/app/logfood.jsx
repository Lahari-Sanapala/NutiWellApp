import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ImageBackground,
  Platform,
  ScrollView,
  KeyboardAvoidingView,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import * as Progress from "react-native-progress";
import * as FileSystem from "expo-file-system";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Video } from "expo-av";
import * as ImageManipulator from "expo-image-manipulator";
import Constants from "expo-constants";


const SnapMeal = () => {
  const [image, setImage] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [summary, setSummary] = useState("");
  const [carbs, setCarbs] = useState(0);
  const [protein, setProtein] = useState(0);
  const [fat, setFat] = useState(0);
  const [mealType, setMealType] = useState("Breakfast");
  const [score, setScore] = useState(0);

  const [userId, setUserId] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // Changed initial state to false for better flow
  const baseURL = Constants.expoConfig.extra.BASE_URL;
  const router = useRouter();

  const [maxNutrient, setMaxNutrient] = useState(100);


  useEffect(() => {
    const fetchData = async () => {
      const storedId = await AsyncStorage.getItem("userId");
      if (storedId) {
        setUserId(storedId);
      }
    };
    fetchData();
  }, []);

  // --- NEW UTILITY FUNCTION TO COMPRESS IMAGE ---
  const compressImage = async (uri) => {
    try {
      const result = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 600 } }],   // <--- Resize
        {
          compress: 0.3,                // <--- Strong compression
          format: ImageManipulator.SaveFormat.JPEG
        }
      );

      // Check final compressed size
      const info = await FileSystem.getInfoAsync(result.uri);
      console.log("Final Compressed Size (bytes):", info.size);

      return result.uri;

    } catch (error) {
      console.error("Compression failed:", error);
      return uri;
    }
  };



  const uploadImageToBackend = async (uri) => {
    try {
      let base64;
      if (Platform.OS === 'web') {
        // Web: Fetch blob and convert to base64
        const response = await fetch(uri);
        const blob = await response.blob();
        base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => {
            const base64String = reader.result;
            // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
            resolve(base64String.split(',')[1]);
          };
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      } else {
        // Mobile: Use FileSystem
        base64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
      }

      console.log("BASE64 LENGTH (after compression):", base64.length);
      console.log("user id from log-food to backend", userId);

      const sanitizedUserId = userId ? userId.replace(/['"]+/g, '').trim() : null;
      console.log("Sanitized userId:", sanitizedUserId);

      // Check if image is still too large after compression (optional safeguard)
      if (base64.length > 16 * 1024 * 1024 * 0.75) { // Roughly 12MB limit for the Base64 string payload
        throw new Error("Compressed image is still too large (over ~12MB Base64 limit).");
      }

      const userResponse = await fetch(`http://10.33.15.69:3000/api/details/${userId}/edit-details`);
      const userDetails = await userResponse.json();

      const {
        name,
        gender,
        age,
        height,
        weight,
        state,
        sleepHours,
        healthIssues,
        activityLevel,
      } = userDetails;


      const response = await fetch(`http://10.33.15.69:3000/api/details/upload-image`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: sanitizedUserId,
          base64Image: base64,
          mealType,
          name,
          gender,
          age,
          height,
          weight,
          state,
          sleepHours,
          activityLevel,
          healthIssues
        }),
      });

      // After your POST request:
      const data = await response.json(); // Parse backend response

      const nutrients = data.food;
      console.log("Received score:", nutrients.score);  // DEBUG

      setScore(Number(nutrients.score) || 0);

      console.log("food object from backend:", data.food);

      console.log("Carbs returned:", data.food.carbs);
      console.log("Protein returned:", data.food.protein);
      console.log("Fat returned:", data.food.fat);

      setCarbs(nutrients.carbs || 0);
      setProtein(nutrients.protein || 0);
      setFat(nutrients.fat || 0);
      setSummary(nutrients.summary || "No summary available");

      // Update max nutrient
      const maxVal = Math.max(nutrients.carbs, nutrients.protein, nutrients.fat, 1);
      setMaxNutrient(maxVal);


      const summaryFromBackend = data.food?.summary || "No summary returned";
      setSummary(summaryFromBackend);

    } catch (err) {
      console.error("❌ Error uploading image:", err.message || err);
      // Display user-friendly error message
      setSummary(`Analysis failed: ${err.message || 'Check server connection or image quality.'}`);
    }
    finally {
      setIsLoading(false);
    }
  };

  // Helper for safe integer parsing
  const safeParseInt = (str) => {
    const num = parseInt(str, 10);
    return isNaN(num) ? 0 : num;
  };

  const processImageAndUpload = async (uri) => {
    setIsLoading(true);
    setSubmitted(true);

    try {
      // 1. Set the original URI for display immediately
      setImage(uri);

      // 2. COMPRESS the image before converting to Base64
      const compressedUri = await compressImage(uri);

      // 3. Upload the compressed image URI
      await uploadImageToBackend(compressedUri);
    } catch (error) {
      console.error('Error during image processing:', error);
      setIsLoading(false);
      setSummary("Error processing image. Please try again.");
    }
  };

  const pickImage = async () => {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        // Use console.error instead of alert per instructions
        console.error("Permission to access gallery is required!");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        await processImageAndUpload(uri);
      }
    } catch (err) {
      console.error('Error picking image:', err);
      setIsLoading(false);
    }
  };

  const captureImage = async () => {
    try {
      const permission = await ImagePicker.requestCameraPermissionsAsync();

      if (!permission.granted) {
        // Use console.error instead of alert per instructions
        console.error("Permission to access camera is required!");
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;
        await processImageAndUpload(uri);
      }
    } catch (error) {
      console.error('Error capturing image:', error);
      setIsLoading(false);
    }
  };

  const goBack = () => {
    setImage(null);
    setSubmitted(false);
    setSummary("");
    setCarbs(0);
    setProtein(0);
    setFat(0);
  };

  const goToDashboard = () => {
    router.push("/dashboard");
  };

  function parseSummary(summary) {
    if (!summary) return null;

    const lines = summary.split('\n');

    return lines.map((line, index) => {
      // Convert * text → • text
      let formattedLine = line.replace(/^\s*\*\s+/g, "• ");

      // Remove orphan single * characters
      formattedLine = formattedLine.replace(/(?<!\*)\*(?!\*)/g, "");

      // Detect bold **text**
      const parts = formattedLine.split(/(\*\*[^*]+\*\*)/g);

      return (
        <Text key={index} style={{ marginBottom: 4 }}>
          {parts.map((part, i) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return (
                <Text key={i} style={{ fontWeight: "bold" }}>
                  {part.slice(2, -2)}
                </Text>
              );
            }
            return part;
          })}
        </Text>
      );
    });
  }


  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior="padding" enabled>
      <ImageBackground
        source={require("../assets/images/background.jpg")}
        style={styles.backgroundd}
        resizeMode="cover"
      >
        <StatusBar style="light" />
        <View style={styles.overlay}>
          <TouchableOpacity onPress={goToDashboard} style={styles.universalBackButton}>
            <Ionicons name="home" size={24} color="#fff" />
          </TouchableOpacity>

          {submitted && (
            <TouchableOpacity onPress={goBack} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#fff" />
              <Text style={styles.backText}>Back</Text>
            </TouchableOpacity>
          )}

          {!submitted ? (
            <>
              <Text style={styles.heading}>Snap Your{"\n"}Meal Before{"\n"}You Dig In</Text>
              <View style={styles.previewContainer}>
                {image ? (
                  <Image source={{ uri: image }} style={styles.previewImage} />
                ) : (
                  <View style={styles.placeholder}>
                    <Ionicons name="image-outline" size={48} color="#aaa" />
                  </View>
                )}
              </View>

              <View style={{ flexDirection: "row", justifyContent: "space-around", marginBottom: 15 }}>
                {["Breakfast", "Lunch", "Snacks", "Dinner"].map((type) => (
                  <TouchableOpacity
                    key={type}
                    onPress={() => setMealType(type)}
                    style={{
                      padding: 8,
                      borderRadius: 10,
                      backgroundColor: mealType === type ? "#ff6600" : "#ccc"
                    }}
                  >
                    <Text style={{ color: "#fff", fontSize: 12 }}>{type}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.buttonRow}>
                <TouchableOpacity style={styles.button} onPress={pickImage}>
                  <Ionicons name="images-outline" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Upload from{"\n"}Gallery</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.button} onPress={captureImage}>
                  <Ionicons name="camera-outline" size={20} color="#fff" />
                  <Text style={styles.buttonText}>Log{"\n"}Food</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              {isLoading ? (
                <View style={styles.videoContainer}>
                  {/* You should replace this Video component with the one from expo-video 
                      to address the deprecation warning, if you haven't already */}
                  <Video
                    source={require("../assets/images/animation.mp4")}
                    rate={1.0}
                    volume={1.0}
                    isMuted={false}
                    resizeMode="cover"
                    shouldPlay
                    isLooping
                    style={styles.loadingVideo}
                  />
                  <Text style={styles.loadingText}>Analyzing your food...</Text>
                </View>
              ) : (
                <ScrollView style={{ flex: 1 }}>

                  <View style={styles.contentContainer}>
                    <View style={styles.card}>
                      <Text style={styles.cardTitle}>Macronutrients</Text>
                      <View style={styles.nutrientStatsRow}>
                        <View style={styles.nutrientStat}>
                          <Text style={styles.statLabel}>Carbs</Text>
                          <Progress.Circle
                            size={80}
                            // Clamping progress to ensure it's between 0 and 1
                            // progress={Math.min(1, Math.max(0, carbs / maxNutrient))} 
                            progress={carbs / maxNutrient}
                            showsText
                            formatText={() => `${carbs}g`}
                            color="#F6C445"
                            thickness={8}
                            borderWidth={0}
                            unfilledColor="#f2f2f2"
                          />
                        </View>
                        <View style={styles.nutrientStat}>
                          <Text style={styles.statLabel}>Protein</Text>
                          <Progress.Circle
                            size={80}
                            // Clamping progress to ensure it's between 0 and 1
                            progress={Math.min(1, Math.max(0, protein / maxNutrient))}
                            showsText
                            formatText={() => `${protein}g`}
                            color="#FF6A5C"
                            thickness={8}
                            borderWidth={0}
                            unfilledColor="#f2f2f2"
                          />
                        </View>
                        <View style={styles.nutrientStat}>
                          <Text style={styles.statLabel}>Fat</Text>
                          <Progress.Circle
                            size={80}
                            // Clamping progress to ensure it's between 0 and 1
                            progress={Math.min(1, Math.max(0, fat / maxNutrient))}
                            showsText
                            formatText={() => `${fat}g`}
                            color="#82B1FF"
                            thickness={8}
                            borderWidth={0}
                            unfilledColor="#f2f2f2"
                          />
                        </View>
                      </View>
                    </View>

                    <View style={styles.summarySection}>
                      <Text style={styles.summaryHeading}>Summary</Text>

                      {/* <Text style={styles.scoreText}>
                        ⭐ Food Quality Score: {score}/10
                      </Text> */}

                      <View style={styles.summaryText}>
                        {parseSummary(summary)}
                      </View>
                    </View>

                  </View>
                </ScrollView>
              )}
            </>
          )}
        </View>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
};


const styles = StyleSheet.create({
  backgroundd: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    padding: 20,
    justifyContent: "space-between",
    paddingBottom: 30,
  },
  heading: {
    color: "#fff",
    fontSize: 31,
    fontWeight: "bold",
    marginTop: 50,
  },
  previewContainer: {
    height: 250,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    backgroundColor: "#00000040",
  },
  previewImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  placeholder: {
    justifyContent: "center",
    alignItems: "center",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  button: {
    backgroundColor: "#ff6600",
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    width: "45%",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    textAlign: "center",
    fontSize: 14,
    marginTop: 5,
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Platform.OS === "ios" ? 50 : 30,
    marginBottom: 10,
  },
  backText: {
    color: "#fff",
    marginLeft: 5,
    fontSize: 16,
  },
  universalBackButton: {
    position: "absolute",
    top: 40,
    left: 20,
    zIndex: 10,
  },
  card: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  nutrientStatsRow: {
    flexDirection: "row",
    justifyContent: "space-evenly",
  },
  nutrientStat: {
    alignItems: "center",
  },
  statLabel: {
    fontSize: 14,
    marginBottom: 5,
    color: "#333",
  },
  summarySection: {
    marginTop: 30,
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  summaryHeading: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  summaryText: {
    fontSize: 14,
    color: "#555",
  },
  videoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  loadingVideo: {
    width: 200,
    height: 200,
    borderRadius: 20,
    marginBottom: 20,
  },
  loadingText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },

});

export default SnapMeal;