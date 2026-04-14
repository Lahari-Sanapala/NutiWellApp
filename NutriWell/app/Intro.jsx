import React from 'react';
import { View, Text, Image, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import intrologo from '../assets/images/intro.jpg';
import { useRouter } from "expo-router";
const HealthIntroScreen = () => {
  const router = useRouter();
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Circular Image */}
      <View style={styles.imageContainer}>
        <Image
          source={intrologo} // Replace with your local image path
          style={styles.image}
        />
      </View>



      {/* Main Text */}
      <Text style={styles.title}>
        Take charge of your health right from your phone
      </Text>

      {/* Features */}
      <View style={styles.featureContainer}>
        <Feature
          icon="🥦"
          text="Track Nutrients"
          desc="Log meals and get insights on calories, protein, carbs, and more"
        />
        <Feature
          icon="📊"
          text="Daily & Weekly Summary"
          desc="View visual breakdowns of your nutrition, hydration, and sleep"
        />
        <Feature
          icon="💡"
          text="Smart Food Suggestions"
          desc="Get diet tips and food ideas based on your health goals"
        />
        <Feature
          icon="🏃‍♂️"
          text="Exercise Plans"
          desc="Personalized workouts to match your fitness and wellness targets"
        />
        <Feature
          icon="💧"
          text="Hydration Tracker"
          desc="Track water intake and get timely reminders to stay hydrated"
        />
        <Feature
          icon="🛌"
          text="Sleep Schedule"
          desc="Set healthy sleep goals and monitor rest quality for recovery"
        />
        <Feature
          icon="🚨"
          text="Smart Alerts"
          desc="Stay informed on excessive nutrient intake & get healthy tips"
        />
        <Feature
          icon="📈"
          text="Track Your Progress"
          desc="Set goals and view your improvements in health over time"
        />
        <Feature
          icon="🧠"
          text="All-in-One Dashboard"
          desc="Monitor diet, activity, sleep & wellness in one simple view"
        />
      </View>


      {/* Continue Button */}
      <TouchableOpacity style={styles.button}>
        <Text style={styles.buttonText} onPress={() => router.replace("/dashboard")}>Continue</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const Feature = ({ icon, text, desc }) => (
  <View style={styles.feature}>
    <Text style={styles.icon}>{icon}</Text>
    <View>
      <Text style={styles.featureTitle}>{text}</Text>
      <Text style={styles.featureDesc}>{desc}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  imageContainer: {
    marginTop: 20,
    marginBottom: 24,
    borderRadius: 100,
    overflow: 'hidden',
    width: 200,
    height: 200,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 24,
    color: '#222',
  },
  featureContainer: {
    width: '100%',
    marginBottom: 32,
  },
  feature: {
    flexDirection: 'row',
    marginBottom: 16,
    alignItems: 'flex-start',
  },
  icon: {
    fontSize: 24,
    marginRight: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  featureDesc: {
    fontSize: 14,
    color: '#666',
  },
  button: {
    backgroundColor: '#2F4F4F',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 24,
    alignSelf: 'center',
    marginBottom: 40,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
  },
});

export default HealthIntroScreen;