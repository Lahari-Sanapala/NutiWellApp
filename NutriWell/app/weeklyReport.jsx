import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, ActivityIndicator, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BarChart, LineChart } from 'react-native-chart-kit';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

const screenWidth = Dimensions.get('window').width;

const getDayLabel = (dateString) => {
    const d = new Date(dateString);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    return days[d.getDay()];
};

export default function WeeklyReportScreen() {
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [chartData, setChartData] = useState({
        labels: [],
        caloriesData: [],
        proteinData: [],
        missedDays: 0
    });

    useEffect(() => {
        const fetchWeeklyAnalytics = async () => {
            try {
                const userId = await AsyncStorage.getItem('userId');
                if (!userId) return router.replace('/');

                const res = await fetch(`http://10.33.15.69:3000/api/details/${userId}/weekly-totals`);
                const data = await res.json();

                if (data && data.dailyBreakdown) {
                    // Reverse to go chronologically left-to-right (oldest -> newest)
                    const chronoData = [...data.dailyBreakdown].reverse();

                    const labels = chronoData.map(d => getDayLabel(d.date));
                    const caloriesData = chronoData.map(d => d.calories || 0);
                    const proteinData = chronoData.map(d => d.protein || 0);
                    
                    const missedDays = chronoData.filter(d => d.calories === 0 && d.protein === 0).length;

                    setChartData({
                        labels,
                        caloriesData,
                        proteinData,
                        missedDays
                    });
                }
            } catch (err) {
                console.error("Error fetching weekly analytics", err);
            } finally {
                setLoading(false);
            }
        };
        fetchWeeklyAnalytics();
    }, []);

    const chartConfig = {
        backgroundGradientFrom: '#ffffff',
        backgroundGradientTo: '#ffffff',
        color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
        labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
        strokeWidth: 2,
        barPercentage: 0.5,
        useShadowColorFromDataset: false,
        decimalPlaces: 0,
    };

    const proteinChartConfig = {
        ...chartConfig,
        color: (opacity = 1) => `rgba(33, 150, 243, ${opacity})`, // Blue for protein
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="green" />
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={28} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Weekly Analytics</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                
                {/* Stats Summary Row */}
                <View style={styles.statsRow}>
                    <View style={styles.statCard}>
                        <Text style={styles.statLabel}>Days Logged</Text>
                        <Text style={styles.statValue}>{7 - chartData.missedDays} / 7</Text>
                    </View>
                    <View style={[styles.statCard, { backgroundColor: chartData.missedDays === 0 ? '#e8f5e9' : '#ffebee' }]}>
                        <Text style={styles.statLabel}>Missed</Text>
                        <Text style={[styles.statValue, { color: chartData.missedDays === 0 ? '#4caf50' : '#f44336' }]}>
                            {chartData.missedDays}
                        </Text>
                    </View>
                </View>

                {/* Calories Graph */}
                <View style={styles.graphCard}>
                    <Text style={styles.graphTitle}>Calories Trend (cal)</Text>
                    <BarChart
                        data={{
                            labels: chartData.labels,
                            datasets: [{ data: chartData.caloriesData.length ? chartData.caloriesData : [0,0,0,0,0,0,0] }]
                        }}
                        width={screenWidth - 40}
                        height={220}
                        yAxisLabel=""
                        chartConfig={chartConfig}
                        style={styles.chart}
                        showValuesOnTopOfBars={true}
                    />
                </View>

                {/* Protein Graph */}
                <View style={styles.graphCard}>
                    <Text style={styles.graphTitle}>Protein Consistency (g)</Text>
                    <LineChart
                        data={{
                            labels: chartData.labels,
                            datasets: [{ data: chartData.proteinData.length ? chartData.proteinData : [0,0,0,0,0,0,0] }]
                        }}
                        width={screenWidth - 40}
                        height={220}
                        chartConfig={proteinChartConfig}
                        style={styles.chart}
                        bezier
                    />
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fafafa',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 10,
        paddingBottom: 15,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee'
    },
    backButton: {
        marginRight: 15,
    },
    headerTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    statsRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 12,
        marginHorizontal: 5,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3.84,
        elevation: 2,
    },
    statLabel: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#333',
    },
    graphCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 15,
        marginBottom: 20,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.1,
        shadowRadius: 4.65,
        elevation: 6,
    },
    graphTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 15,
        marginLeft: 10,
    },
    chart: {
        borderRadius: 12,
        left: -10, // shifts layout natively correctly within padding
    }
});
