import React, { useState, useEffect, useImperativeHandle } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, Image } from 'react-native';
import MealCard from './mealcard';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";


export default function Tracking() {
  const router = useRouter();
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const baseURL = Constants.expoConfig.extra.BASE_URL;

  useEffect(() => {
    const fetchData = async () => {
      const storedId = await AsyncStorage.getItem("userId");
      console.log('storedid from tracking', storedId)
      if (storedId) {
        console.log("User ID from tracking:", storedId);
        setUserId(storedId);
        fetchDailyTotals(storedId);
        fetchWeeklyTotals(storedId);
      }
    };
    fetchData();
  }, []);


  useEffect(() => {
    const fetchMeals = async () => {
      try {
        setLoading(true);
        console.log("sending user id to meals route from tracking", userId)
        const response = await fetch(`http://192.168.138.205:3000/api/details/${userId}/meals`);

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        console.log("meals data", meals)
        setMeals(data);
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchMeals();
  }, [userId]);

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading meals...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingTop: 20 }} style={styles.container}>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <Ionicons name="arrow-back" size={24} color="#2F4F4F" />
        {/* <Text style={styles.backText}>Back</Text> */}
        <Text style={styles.heading}>Meal Plan</Text>
      </TouchableOpacity>


      {meals.length > 0 ? (
        meals.map(meal => (
          <MealCard key={meal.id} meal={meal} router={router} />
        ))
      ) : (
        <Text style={styles.noMealsText}>No meals tracked yet</Text>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f8ede1ff', paddingTop: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  backText: {
    marginLeft: 8,
    color: '#2F4F4F',
    fontSize: 16,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
    marginLeft: 10,
    color: '#2F4F4F',
  },
  noMealsText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
  },
});