import { View, Text, StyleSheet, Dimensions } from "react-native";
import LottieView from "lottie-react-native";
import { useEffect, useRef,useState } from "react";
import animation from "../assets/animations/stethoscope.json";
//import { LinearTextGradient } from "react-native-text-gradient";
import ShimmerText from './components/ShimmerText';
import { useRouter } from "expo-router";


const screenWidth = Dimensions.get("window").width;


export default function Title() {
  const router=useRouter();
  const fullCaption = "Wee'll treat you well";
  const [caption, setCaption] = useState("");

  const hasTyped = useRef(false);
  useEffect(() => {
    if (hasTyped.current) return;
    hasTyped.current = true;

    let index = 0;
    const interval = setInterval(() => {
      setCaption((prev) => prev + fullCaption.charAt(index));
      index++;
      if (index === fullCaption.length) clearInterval(interval);
    }, 100);
    return () => clearInterval(interval);
  }, []);
    // ✨ 2. Auto Redirect after 10 seconds
    useEffect(() => {
      const timeout = setTimeout(() => {
        router.replace("/signup"); // Make sure you have app/signup.js created
      }, 5000);
  
      return () => clearTimeout(timeout);
    }, []);
  return (
    <View style={styles.container}>
      <LottieView
        source={animation}
        autoPlay
        loop
        style={styles.lottie}
      />
      <View style={styles.textOverlay}>
      <ShimmerText text="NutriWell" />

      </View>
      <Text style={styles.caption}>{caption}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fffaf0",
    alignItems: "center",
    justifyContent: "center",
  },
  lottie: {
    width: screenWidth,
    height: 300,
  },
  textOverlay: {
    position: "absolute",
    top: "38%",
    left: "30%",
    transform: [{ translateX: -10 }, { translateY: 10 }],
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
  },
  caption: {
    fontSize: 18,
    fontStyle: "italic",
    marginTop: 10,
    color: "#555",
  },
});
