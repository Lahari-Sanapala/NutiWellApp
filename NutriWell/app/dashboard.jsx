import React, { useEffect, useState, useRef } from 'react';
import { Modal, Pressable, View, Text, FlatList, SafeAreaView, ScrollView, Image, StyleSheet, TouchableOpacity, ImageBackground, Dimensions, LogBox } from 'react-native';
import { Ionicons, MaterialIcons, FontAwesome5, Entypo } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { PieChart } from 'react-native-chart-kit';
import * as Progress from 'react-native-progress';
import img from "../assets/images/blue_green.jpeg";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from "expo-constants";
import { useMemo } from 'react';

LogBox.ignoreLogs([
  'VirtualizedLists should never be nested inside plain ScrollViews'
]);

const dietPlans = [
  {
    title: 'Scan or Upload',
    description: 'Instantly analyze meals by scanning them live or uploading',
    backgroundColor: '#EDA345',
    image: require('../assets/images/food_upload.png'),
  },
  {
    title: 'Smart Food Detection',
    description: 'Identify food items using intelligent image recognition',
    backgroundColor: '#B0C8FF',
    image: require('../assets/images/food.png'),
  },
  {
    title: 'Personalized Diet Plans',
    description: 'Get the perfect diet plan based on your food habits and health goals',
    backgroundColor: 'pink',
    image: require('../assets/images/diet_planning.png'),
  },
  {
    title: 'Nutritional Breakdown',
    description: 'Dive into your meal’s calories, macros, and nutrients.',
    backgroundColor: '#A7FFAF',
    image: require('../assets/images/nutritional.png'),
  },
  {
    title: 'Fitness Suggestions',
    description: 'Receive workout recommendations that match your fitness level',
    backgroundColor: '#EDA345',
    image: require('../assets/images/fitness.png'),
  },
  {
    title: 'Health Tips & Remedies',
    description: 'Daily health tips and simple home remedies to keep you energized and in balance',
    backgroundColor: '#B0C8FF',
    image: require('../assets/images/tips.png'),
  },
  {
    title: 'Progress Tracking',
    description: 'Monitor your diet and fitness journey with easy-to-read progress visuals and reminders',
    backgroundColor: 'pink',
    image: require('../assets/images/progress.png'),
  },
  {
    title: 'AI Chat Assistant',
    description: 'Chat with our smart assistant for diet advice, health queries, or fitness tips — anytime',
    backgroundColor: '#D4B8F5',
    image: require('../assets/images/robo.png'),
  },
];



const getCalorieGoal = (activity) => {
  if (!activity) return 2200;

  switch (activity.toLowerCase().trim()) {
    case "sedentary":
      return 1800;
    case "light active":
      return 2000;
    case "moderate active":
      return 2300;
    case "heavy active":
      return 2600;
    case "very heavy":
      return 3000;
    default:
      return 2200;
  }
};


const DietCard = ({ title, description, backgroundColor, image, isImageRight }) => {
  const textAlignStyle = isImageRight ? { paddingRight: 80 } : { paddingLeft: 80 };
  const imageStyle = isImageRight ? { right: -30, bottom: -30 } : { left: -30, bottom: -30 };

  return (
    <View style={styles.cardWrapper}>
      <View style={[styles.card, { backgroundColor }]}>
        <View style={[styles.cardContent, textAlignStyle]}>
          <Text style={styles.cardTitle}>{title}</Text>
          <Text style={styles.cardDescription}>{description}</Text>
        </View>
        <Image source={image} style={[styles.cardImage, imageStyle]} />
      </View>
    </View>
  );
};

export default function NutriWellHomeScreen() {

  console.log("in dashaboard")
  const router = useRouter();
  const [visible, setVisible] = useState(false);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [userId, setUserId] = useState(null);
  const [dailyTotals, setDailyTotals] = useState({
    calories: 0,
    carbs: 0,
    protein: 0,
    fat: 0
  });
  const [weeklyTotals, setWeeklyTotals] = useState({
    calories: 0,
    carbs: 0,
    protein: 0,
    fat: 0
  });

  const [activityLevel, setActivityLevel] = useState(null);

  const [water, setWater] = useState(0);
  const [waterGoal, setWaterGoal] = useState(8);
  const [unreadNotifications, setUnreadNotifications] = useState(false);

  console.log("ActivityLevel:", activityLevel)

  // Poll for Unread Notifications Badge
  useEffect(() => {
    if (!userId) return;
    const checkUnread = async () => {
      try {
        const res = await fetch(`http://10.33.15.69:6001/api/notifications/get?userId=${userId}`);
        const data = await res.json();
        
        const lastSeenDate = await AsyncStorage.getItem('lastSeenNotificationDate');
        const lastSeen = await AsyncStorage.getItem('lastSeenNotificationCount');
        
        const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Kolkata' });

        let lastSeenNum = 0;
        // Only respect the saved count if the saved date matches exactly today!
        if (lastSeenDate === todayStr && lastSeen) {
            lastSeenNum = parseInt(lastSeen, 10);
        }
        
        // If server returns more notifications than what phone last remembers today = show badge!
        if (data && data.length > lastSeenNum) {
          setUnreadNotifications(true);
        } else {
          setUnreadNotifications(false);
        }
      } catch (err) {
        console.error("Error polling notifications for badge", err);
      }
    };
    checkUnread();
    const interval = setInterval(checkUnread, 10000);
    return () => clearInterval(interval);
  }, [userId]);

  const fetchDailyTotals = async (currentUserId) => {
    if (!currentUserId) return;
    try {
      const response = await fetch(`http://10.33.15.69:3000/api/details/${currentUserId}/daily-totals`);
      const data = await response.json();
      console.log("response from daily-totals", data);
      if (data.totals) {
        setDailyTotals(data.totals);
      }
    } catch (error) {
      console.error('Error fetching daily totals:', error);
    }
  };

  const fetchWater = async (currentUserId) => {
    if (!currentUserId) return;
    try {
      const response = await fetch(`http://10.33.15.69:3000/api/water/${currentUserId}`);
      const data = await response.json();

      console.log("💧 Water API response:", data);

      if (data.water !== undefined) {
        setWater(data.water);
      }
    } catch (error) {
      console.error("Error fetching water:", error);
    }
  };

  const addWater = async () => {
  try {
    const response = await fetch(`http://10.33.15.69:3000/api/water/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        amount: 1,
      }),
    });

    const data = await response.json();
    setWater(data.water);
  } catch (error) {
    console.error("Error adding water:", error);
  }
};

const removeWater = async () => {
  if (water <= 0) return;

  try {
    const response = await fetch(`http://10.33.15.69:3000/api/water/remove`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        userId,
        amount: 1,
      }),
    });

    const data = await response.json();
    setWater(data.water);
  } catch (error) {
    console.error("Error removing water:", error);
  }
};

  const fetchWeeklyTotals = async (currentUserId) => {
    if (!currentUserId) return;
    try {
      const response = await fetch(`http://10.33.15.69:3000/api/details/${currentUserId}/weekly-totals`);
      const data = await response.json();
      console.log("response from weekly-totals", data);
      if (data.weeklyTotals) {
        setWeeklyTotals(data.weeklyTotals);
      }
    } catch (error) {
      console.error('Error fetching weekly totals:', error);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      const storedId = await AsyncStorage.getItem("userId");
      console.log('storedid from dashboard', storedId);

      if (storedId) {
        console.log("User ID from dashboard:", storedId);
        setUserId(storedId);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    if (!userId) return;

    console.log("User ID updated, fetching totals again...");

    fetchDailyTotals(userId);
    fetchWeeklyTotals(userId);
    fetchWater(userId);
  }, [userId]);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await fetch(`http://10.33.15.69:3000/api/details/${userId}/edit-details`);
        const data = await response.json();

        console.log("🔥 FULL USER DETAILS RESPONSE:", data);
        console.log("💧 Water Goal from backend:", data.nutrition?.waterGlasses);

        if (response.ok) {
          console.log('User info:', data);
          setFullName(data.name);
          setEmail(data.email);
          setActivityLevel(data.activityLevel);

          console.log("💧 Water Goal from backend:", data.nutrition?.waterGlasses);

          if (data.nutrition?.waterGlasses) {
            setWaterGoal(data.nutrition.waterGlasses);
          }

        } else {
          throw new Error(data.error || 'Failed to fetch user info');
        }
      } catch (error) {
        console.error('Error:', error);
      }
    };

    if (userId) {
      fetchUserInfo();
    }
  }, [userId]);


  const carbs = Number(dailyTotals.carbs) || 0;
  const protein = Number(dailyTotals.protein) || 0;
  const fat = Number(dailyTotals.fat) || 0;

  const totalMacronutrients = carbs + protein + fat;

  const carbsPercentage = totalMacronutrients > 0 ? (dailyTotals.carbs / totalMacronutrients) * 100 : 0;
  const proteinPercentage = totalMacronutrients > 0 ? (dailyTotals.protein / totalMacronutrients) * 100 : 0;
  const fatPercentage = totalMacronutrients > 0 ? (dailyTotals.fat / totalMacronutrients) * 100 : 0;

  // Daily calorie goal (adjust as needed)

  const dailyCalorieGoal = useMemo(() => getCalorieGoal(activityLevel), [activityLevel]);

  const handleLogout = async () => {
    try {
      // Remove the userId from AsyncStorage
      await AsyncStorage.removeItem('userId');

      // Optionally, navigate to the login screen (or any screen you want to navigate to after logout)
      router.push('/signup'); // Adjust the path as per your routing structure

      console.log('Logged out successfully');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  const videoRef = useRef(null);

  useEffect(() => {
    return () => {
      // Clean up video on unmount
      if (videoRef.current) {
        videoRef.current.unloadAsync();
      }
    };
  }, []);

  return (
    <ImageBackground source={require('../assets/images/main_background.jpg')} style={styles.background} resizeMode="cover">
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setVisible(!visible)} style={styles.profileCircle}>
              <Ionicons name="person-circle-outline" size={36} color="green" />
            </TouchableOpacity>

            {visible && (
              <Modal
                animationType="fade"
                transparent={true}
                visible={visible}
                onRequestClose={() => setVisible(false)}
              >
                <Pressable style={styles.modalOverlay} onPress={() => setVisible(false)}>
                  <View style={styles.modalContainer}>
                    <View style={styles.profileRow}>
                      <Ionicons name="person-circle-outline" size={50} color="#333" />
                      <View style={{ marginLeft: 10 }}>
                        <Text style={styles.username}>{fullName || 'User'}</Text>
                        <Text style={styles.email}>{email || ''}</Text>
                      </View>
                    </View>
                    <View style={styles.buttonRow}>
                      <TouchableOpacity style={styles.button}>
                        <Text style={styles.buttonText} onPress={() => router.push('/editDetails')}>Edit details</Text>
                      </TouchableOpacity>
                      <TouchableOpacity style={styles.button} onPress={handleLogout}>
                        <Text style={styles.buttonText}>Logout</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Pressable>
              </Modal>
            )}

            <Text style={styles.appTitle}>NutriWell</Text>
            <Pressable onPress={() => { setUnreadNotifications(false); router.push('/App'); }}>
              <View style={[styles.notificationCircle, { backgroundColor: '#e0e0e0', position: 'relative' }]}>
                <Ionicons name="notifications-outline" size={22} color="green" />
                {unreadNotifications && (
                  <View style={{
                    position: 'absolute',
                    top: 6,
                    right: 8,
                    width: 10,
                    height: 10,
                    borderRadius: 5,
                    backgroundColor: 'red',
                    borderWidth: 1,
                    borderColor: 'white'
                  }} />
                )}
              </View>
            </Pressable>
          </View>

          {userId ? (
            <Text style={styles.welcome}>Welcome, {fullName}</Text>
          ) : (
            <Text style={styles.welcome}>Welcome, Guest</Text>
          )}

          {/* Today Card */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Today</Text>
            <Text style={styles.label}>Calories</Text>
            <Text style={styles.value}>{dailyTotals.calories} / {dailyCalorieGoal} Cal</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Water Intake 💧</Text>

            <Text style={styles.value}>{water} / {waterGoal} glasses</Text>

            <Progress.Bar
              progress={Math.min(water / waterGoal, 1)}
              width={null}
              height={10}
              color="#4da6ff"
              style={{ marginVertical: 10 }}
            />

            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <TouchableOpacity onPress={removeWater} style={styles.waterBtn}>
                <Text style={styles.waterBtnText}>-</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={addWater} style={styles.waterBtn}>
                <Text style={styles.waterBtnText}>+</Text>
              </TouchableOpacity>
            </View>
          </View>

          <Text style={styles.cardTitle}>Nutrients</Text>
          <PieChart
            data={[
              {
                name: 'Carbs',
                population: Number(dailyTotals.carbs) || 0,

                color: '#3498db',
                legendFontColor: '#7F7F7F',
                legendFontSize: 12,
                legendLabel: `Carbs • ${(isNaN(carbsPercentage) ? 0 : carbsPercentage).toFixed(1)}%`,

              },
              {
                name: 'Proteins',
                population: Number(dailyTotals.protein) || 0,
                color: '#2ecc71',
                legendFontColor: '#7F7F7F',
                legendFontSize: 12,
                legendLabel: `Proteins • ${(isNaN(proteinPercentage) ? 0 : proteinPercentage).toFixed(1)}%`,

              },
              {
                name: 'Fats',
                population: Number(dailyTotals.fat) || 0,
                color: '#f1c40f',
                legendFontColor: '#7F7F7F',
                legendFontSize: 12,
                legendLabel: `Fats • ${(isNaN(fatPercentage) ? 0 : fatPercentage).toFixed(1)}%`,

              },
            ]}
            width={Dimensions.get('window').width - 32}
            height={200}
            chartConfig={{
              backgroundColor: '#fff',
              backgroundGradientFrom: '#fff',
              backgroundGradientTo: '#fff',
              color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            }}
            accessor="population"
            backgroundColor="transparent"
            paddingLeft="15"
          />

          {/* Weekly Calories */}
          {/* Weekly Calories */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Weekly</Text>
            <Text style={styles.label}>Calories</Text>
            <Text style={styles.value}>{weeklyTotals.calories} / {dailyCalorieGoal * 7} KCal</Text>
          </View>

          {/* Macronutrients */}
          {/* Weekly Macronutrients */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Weekly Macronutrients</Text>
            <View style={styles.nutrientStatsRow}>
              <View style={styles.nutrientStat}>
                <Text style={styles.statLabel}>Carbs</Text>
                <Progress.Circle
                  size={80}
                  progress={
                    isNaN(weeklyTotals.carbs / (300 * 7))
                      ? 0
                      : weeklyTotals.carbs / (300 * 7)
                  }
                  showsText={true}
                  formatText={() => `${Number(weeklyTotals.carbs) || 0}g`}
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
                  progress={
                    isNaN(weeklyTotals.protein / (150 * 7))
                      ? 0
                      : weeklyTotals.protein / (150 * 7)
                  }
                  showsText={true}
                  formatText={() => `${Number(weeklyTotals.protein) || 0}g`}
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
                  progress={
                    isNaN(weeklyTotals.fat / (80 * 7))
                      ? 0
                      : weeklyTotals.fat / (80 * 7)
                  }
                  showsText={true}
                  formatText={() => `${Number(weeklyTotals.fat) || 0}g`}
                  color="#82B1FF"
                  thickness={8}
                  borderWidth={0}
                  unfilledColor="#f2f2f2"
                />
              </View>
            </View>
          </View>

          <Text style={styles.headerText}>Eat Well Live Well</Text>
          <FlatList
            data={dietPlans || []}
            keyExtractor={(item) => item.title}
            renderItem={({ item, index }) => (
              <DietCard
                title={item.title}
                description={item.description}
                backgroundColor={item.backgroundColor}
                image={item.image}
                isImageRight={index % 2 === 1}
              />
            )}
            contentContainerStyle={{ paddingBottom: 30 }}
            nestedScrollEnabled={true}
          />
        </ScrollView>

        {/* Bottom Navigation Bar */}

      </SafeAreaView>
      <View style={styles.navbar}>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/dashboard')}>
          <Ionicons name="home-outline" size={22} />
          <Text style={styles.navLabel}>Dashboard</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/tracking')}>
          <MaterialIcons name="insights" size={22} />
          <Text style={styles.navLabel}>Tracking</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItemCenter} onPress={() => router.push('/logfood')}>
          <Entypo name="plus" size={22} />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/fitness')}>
          <FontAwesome5 name="dumbbell" size={20} />
          <Text style={styles.navLabel}>Fitness</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navItem} onPress={() => router.push('/chatbot')}>
          <Ionicons name="chatbubbles-outline" size={22} />
          <Text style={styles.navLabel}>Chatbot</Text>
        </TouchableOpacity>
      </View>
    </ImageBackground>
  );
}

// ... keep all your existing styles ...

// Styles remain exactly the same
const styles = StyleSheet.create({
  background: {
    flex: 1,
    height: '100%', width: '100%',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'left',
    alignItems: 'left',
  },
  modalContainer: {
    width: 300,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginTop: 60,
    marginLeft: 20,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 10,
  },

  topIcon: {
    position: 'absolute',
    top: 10,
    left: 20,
    zIndex: 10,
  },
  popupCard: {
    position: 'absolute',
    top: 60,
    left: 20,
    width: 300,
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 1, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 9,
  },
  profileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  username: {
    fontSize: 18,
    fontWeight: '600',
  },
  email: {
    fontSize: 14,
    color: '#555',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  button: {
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  buttonText: {
    fontSize: 14,
    color: '#333',
  },
  scrollContent: {
    padding: 5,
    paddingBottom: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileCircle: {
    backgroundColor: '#e0e0e0',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  appTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2F4F4F', // Dark Slate Gray

    textShadowColor: 'white',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 1,
  },
  notificationCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },

  welcome: {
    fontSize: 18,
    marginVertical: 12,
    fontWeight: '500',
    marginLeft: 10,
    marginTop: 20,
  },

  label: {
    fontSize: 14,
    color: '#888',
    marginLeft: 5,
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginLeft: 5,
  },
  nutrientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nutrientItem: {
    fontSize: 15,
    marginVertical: 2,
  },
  piechart: {
    width: 180,
    height: 180,
    resizeMode: 'contain',
  },
  nutrientStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  nutrientStat: {
    alignItems: 'center',
  },
  statLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  statCircle: {
    backgroundColor: '#e0e0e0',
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },
  statText: {
    fontWeight: '600',
  },
  navbar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 10,
    paddingHorizontal: 12,
    backgroundColor: 'white',
    borderTopWidth: 0.5,
    borderTopColor: '#ccc',

    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,       // ensures full width
  },

  navItem: {
    alignItems: 'center',
  },
  navItemCenter: {
    backgroundColor: '#f8ede1ff',
    width: 44,
    height: 44,
    borderRadius: 22,
    borderColor: '#e1f3e6ff',
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -20,
  },
  navLabel: {
    fontSize: 12,
    marginTop: 2,
  },

  container: {
    flex: 1,

    padding: 16,
  },
  headerText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1D2D5F',
    marginBottom: 16,
    textAlign: 'center',
    marginTop: 20,
  },
  cardWrapper: {
    marginBottom: 40,
    alignItems: 'center',
  },
  card: {
    width: '100%',
    padding: 20,
    borderRadius: 10, // more rounded for a modern card feel

    // iOS shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,

    // Android shadow
    elevation: 6,

    backgroundColor: '#FFEFD5', // adds visibility and soft contrast
    overflow: 'visible',
    position: 'relative',
    marginBottom: 10,
    marginTop: 10,
  },

  cardContent: {
    zIndex: 1,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1D2D5F',
    marginLeft: 5,

  },
  cardDescription: {
    fontSize: 14,
    color: '#333',
    marginTop: 6,
  },
  cardImage: {
    width: 130,
    height: 130,
    resizeMode: 'contain',
    position: 'absolute',
    zIndex: 0,
    opacity: 0.9,
  },
  waterBtn: {
    backgroundColor: "#4da6ff",
    padding: 10,
    borderRadius: 10,
    width: 50,
    alignItems: "center",
  },

  waterBtnText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
});