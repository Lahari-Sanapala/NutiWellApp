import React, { useState, useEffect } from 'react';
import { View, ScrollView, StyleSheet, Text, TouchableOpacity, ActivityIndicator, SafeAreaView } from 'react-native';
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
  
  // New States for AI Analysis
  const [analyzingType, setAnalyzingType] = useState(null);
  const [analysisData, setAnalysisData] = useState({});

  const baseURL = Constants.expoConfig.extra.BASE_URL || "http://10.33.15.69:3000";

  useEffect(() => {
    const fetchData = async () => {
      const storedId = await AsyncStorage.getItem("userId");
      if (storedId) {
        setUserId(storedId);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchMeals = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${baseURL}/api/details/${userId}/meals`);

        if (!response.ok) {
          throw new Error(`Request failed with status ${response.status}`);
        }

        const data = await response.json();
        setMeals(data);
      } catch (error) {
        console.error('Fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchMeals();
  }, [userId, baseURL]);

  const handleAnalyze = async (mealType) => {
    setAnalyzingType(mealType);
    try {
      const res = await axios.post(`${baseURL}/api/details/${userId}/meal-analysis`, {
        mealType
      });
      setAnalysisData(prev => ({ ...prev, [mealType]: res.data.analysis }));
    } catch (error) {
      console.error("Error fetching analysis:", error);
      setAnalysisData(prev => ({ 
        ...prev, 
        [mealType]: "Error fetching analysis. Make sure you have food logged for this meal." 
      }));
    } finally {
      setAnalyzingType(null);
    }
  };

  const closeAnalysis = (mealType) => {
    setAnalysisData(prev => {
      const next = { ...prev };
      delete next[mealType];
      return next;
    });
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
        <Text key={index} style={{ marginBottom: 4, lineHeight: 22, color: '#333' }}>
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

  const mealCategories = ["Breakfast", "Lunch", "Snacks", "Dinner"];
  
  const groupedMeals = mealCategories.reduce((acc, cat) => {
    acc[cat] = meals.filter(m => m.mealType === cat);
    return acc;
  }, {});

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#2F4F4F" />
        <Text style={{marginTop: 10, color: '#2F4F4F'}}>Loading your meals...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#2F4F4F" />
          <Text style={styles.heading}>Meal Plan Tracking</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} style={styles.scrollView}>
        {meals.length === 0 ? (
          <Text style={styles.noMealsText}>No meals tracked for today yet.</Text>
        ) : (
          mealCategories.map(cat => {
            const categoryMeals = groupedMeals[cat];
            if (categoryMeals.length === 0) return null; // Don't show empty categories

            return (
              <View key={cat} style={styles.categorySection}>
                <View style={styles.categoryHeader}>
                  <Text style={styles.categoryTitle}>{cat}</Text>
                  <TouchableOpacity 
                    style={styles.analyzeButton} 
                    onPress={() => handleAnalyze(cat)}
                    disabled={analyzingType === cat}
                  >
                    {analyzingType === cat ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <Text style={styles.analyzeButtonText}>Analyze</Text>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Analysis Result Box */}
                {analysisData[cat] && (
                  <View style={styles.analysisBox}>
                    <View style={styles.analysisBoxHeader}>
                      <Text style={styles.analysisBoxTitle}>✨ AI Insights</Text>
                      <TouchableOpacity onPress={() => closeAnalysis(cat)} style={styles.minimizeBtn}>
                        <Ionicons name="close-circle" size={24} color="#2F4F4F" />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.analysisTextContainer}>
                      {parseSummary(analysisData[cat])}
                    </View>
                  </View>
                )}

                {/* Meal Cards */}
                {categoryMeals.map(meal => (
                  <MealCard key={meal.id} meal={meal} router={router} />
                ))}
              </View>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8ede1ff',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#f8ede1ff',
    zIndex: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    marginLeft: 10,
    color: '#2F4F4F',
  },
  noMealsText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#666',
    fontSize: 16,
  },
  categorySection: {
    marginBottom: 24,
  },
  categoryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 8,
  },
  categoryTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2F4F4F', // Changed from Red to Theme Green
  },
  analyzeButton: {
    backgroundColor: '#2F4F4F',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  analyzeButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  analysisBox: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#eee',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  analysisBoxHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  analysisBoxTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2F4F4F',
  },
  minimizeBtn: {
    padding: 2,
  },
  analysisTextContainer: {
    marginTop: 4,
  }
});