import React, { useEffect, useRef } from "react";
import { Animated, Text, View, StyleSheet, Dimensions } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

const screenWidth = Dimensions.get("window").width;

export default function ShimmerText({ text }) {
  const shimmerAnim = useRef(new Animated.Value(-1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 2000,
        useNativeDriver: true,
      })
    ).start();
  }, [shimmerAnim]);

  const translateX = shimmerAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: [-screenWidth, screenWidth],
  });

  return (
    <View style={styles.container}>
      <Text style={styles.text}>{text}</Text>
      <Animated.View
        style={[
          styles.shimmerOverlay,
          { transform: [{ translateX }] }
        ]}
      >
        <LinearGradient
          colors={["transparent", "rgba(255,255,255,0.6)", "transparent"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.gradient}
        />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "relative",
  },
  text: {
    fontSize: 25,
    fontWeight: "bold",
    color: "violet",
    textAlign: "center" // base text color
  },
  shimmerOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    width: 100,
    height: "100%",
  },
});
