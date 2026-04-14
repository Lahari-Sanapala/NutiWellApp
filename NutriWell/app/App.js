import React, { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';

export default function App() {
  const router = useRouter();
  const [notifications, setNotifications] = useState([]);

  const [lastUpdated, setLastUpdated] = useState(new Date());

  const fetchNotifications = () => {
    fetch("http://192.168.138.205:6001/api/notifications/get")
      .then(res => res.json())
      .then(data => {
        setNotifications(data);
        setLastUpdated(new Date());
      })
      .catch(err => console.error('Error fetching notifications:', err));
  };

  useEffect(() => {
    fetchNotifications(); // Fetch immediately on mount

    const interval = setInterval(fetchNotifications, 10000); // Fetch every 10 seconds

    return () => clearInterval(interval); // Cleanup on unmount
  }, []);

  return (
    <ImageBackground
      source={require('../assets/images/not_back4.jpg')}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.overlay}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>NutriWell Notifications</Text>

        <ScrollView contentContainerStyle={styles.notificationWrapper}>
          {notifications.map((note, index) => (
            <View
              key={index}
              style={[
                styles.notificationCard,
                styles[`card${index % 5}`],
              ]}
            >
              <Image
                source={require('../assets/images/not_icon.jpg')}
                style={styles.icon}
              />
              <Text style={styles.message}>{note.message}</Text>
            </View>
          ))}
        </ScrollView>
      </View>
    </ImageBackground>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    backgroundColor: '#ffffff',
    //backgroundImage: 'url("./assets/images/not_back4.jpeg")', // Expo doesn't support background-image, use `ImageBackground` if needed
    alignItems: 'center',
  },
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  overlay: {
    flex: 1,
    paddingTop: 60,
    paddingBottom: 30,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.3)', // semi-transparent overlay for readability
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: '#ffffffaa',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    zIndex: 10,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#ffffff',
    textAlign: 'center',
    width: '100%',
  },
  notificationWrapper: {
    width: '100%',
    alignItems: 'center',
  },
  notificationCard: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 15,
    marginBottom: 30,
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 3,
  },
  icon: {
    width: 35,
    height: 35,
    marginRight: 12,
  },
  message: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    flex: 1,
    flexWrap: 'wrap',
  },

  // Loop background colors using modulo
  card0: {
    backgroundColor: '#D1F2EB',
  },
  card1: {
    backgroundColor: '#FCF3CF',
  },
  card2: {
    backgroundColor: '#D6EAF8',
  },
  card3: {
    backgroundColor: '#FADBD8',
  },
  card4: {
    backgroundColor: '#E8DAEF',
  },
});
