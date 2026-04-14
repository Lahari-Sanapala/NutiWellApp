// OnboardingFormApp.js
import React, { useState, useEffect } from 'react';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';





import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Alert, FlatList, Modal, ImageBackground
} from 'react-native';

import Constants from "expo-constants";

const indianStates = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh', 'Goa',
  'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka', 'Kerala',
  'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram', 'Nagaland',
  'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal', 'Delhi'
];
const activityOptions = [
  "Sedentary",
  "Light Active",
  "Moderate Active",
  "Heavy Active",
  "Very Heavy"
];


export default function editDetails() {
  const [page, setPage] = useState(1);
  const [name, setName] = useState('');
  const [gender, setGender] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [state, setState] = useState('');
  const [sleepHours, setSleepHours] = useState('');
  const [healthIssue, setHealthIssue] = useState('');
  const [healthIssuesList, setHealthIssuesList] = useState([]);
  const [activityLevel, setActivityLevel] = useState('');
  const [activityModal, setActivityModal] = useState(false);
  const [errors, setErrors] = useState({});
  const [modalVisible, setModalVisible] = useState(false);
  const [userId, setUserId] = useState(null);
  const baseURL = Constants.expoConfig.extra.BASE_URL;

  const validatePage1 = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = true;
    if (!gender) newErrors.gender = true;
    const ageNum = parseInt(age);
    if (!ageNum || ageNum <= 0) newErrors.age = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePage2 = () => {
    const newErrors = {};
    if (!height || isNaN(height)) newErrors.height = true;
    if (!weight || isNaN(weight)) newErrors.weight = true;
    if (!state) newErrors.state = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePage3 = () => {
    const newErrors = {};
    if (!sleepHours || isNaN(sleepHours)) newErrors.sleepHours = true;
    if (!activityLevel) newErrors.activityLevel = true;
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const nextPage = () => {
    if (page === 1 && validatePage1()) setPage(2);
    else if (page === 2 && validatePage2()) setPage(3);
  };

  const prevPage = () => {
    if (page > 1) setPage(page - 1);
  };

  // const submit = () => {
  //   if (validatePage3()) {
  //     // Alert.alert('Submitted', 'Your details are locked successsfully!');
  //     Alert.alert('Chomp Chomp!', 'Data digested. You’re on the wellness express 🥑🚂');

  //   }
  // };


  const submit = async () => {
    if (!validatePage3()) return;

    try {
      //const userId = await AsyncStorage.getItem('userId');
      // Retrieve the userId from localStorage

      if (!userId) {
        Alert.alert("Error", "User not logged in");
        return;
      }

      const userData = {
        userId,  // Use the dynamic userId from localStorage
        name,
        gender,
        age,
        height,
        weight,
        state,
        sleepHours,
        activityLevel,
        healthIssues: healthIssuesList,
      };

      const response = await fetch("http://192.168.138.205:3000/api/details/submit", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const result = await response.json();

      if (response.ok) {
        //Alert.alert("Success", result.message);
        Alert.alert('Chomp Chomp!', 'Data digested. You’re on the wellness express 🥑🚂');
      } else {
        Alert.alert("Error", result.message || "Something went wrong");
      }
    } catch (error) {
      Alert.alert("Error", "Failed to connect to server: " + error.message);
    }
  };

  const addHealthIssue = () => {
    if (healthIssue.trim()) {
      setHealthIssuesList([...healthIssuesList, healthIssue.trim()]);
      setHealthIssue('');
    }
  };
  const removeHealthIssue = (index) => {
    const updatedList = [...healthIssuesList];
    updatedList.splice(index, 1);
    setHealthIssuesList(updatedList);
  };

  const renderProgress = () => (
    <View style={styles.progressBar}>
      {[1, 2, 3].map(i => (
        <View key={i} style={[styles.bar, page >= i && styles.barActive]} />
      ))}
    </View>
  );


  const router = useRouter();

  const handleNext = () => {
    if (page === 1 && validatePage1()) {
      setPage(2);
    } else if (page === 2 && validatePage2()) {
      setPage(3);
    } else if (page === 3 && validatePage3()) {
      submit();  // Trigger form submission
      setTimeout(() => router.replace('/Intro'), 1000); // 1-second delay
      //router.replace('/dashboard');  // Redirect after successful validation
    }
  };





  useEffect(() => {
    const fetchData = async () => {
      const storedId = await AsyncStorage.getItem("userId");
      console.log('storedid from editDetails', storedId)
      if (storedId) {
        console.log("User ID from editDetails:", storedId);
        setUserId(storedId);
        fetchDailyTotals(storedId);
        fetchWeeklyTotals(storedId);
      }
    };
    fetchData();
  }, []);


  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        // const storedUserId = await AsyncStorage.getItem('userId');
        // if (!storedUserId) return;

        const response = await fetch(`http://192.168.138.205:3000/api/details/${userId}/edit-details`);
        const data = await response.json();

        if (response.ok) {
          setName(data.name || '');
          setGender(data.gender || '');
          setAge(data.age?.toString() || '');
          setHeight(data.height?.toString() || '');
          setWeight(data.weight?.toString() || '');
          setState(data.state || '');
          setSleepHours(data.sleepHours?.toString() || '');
          setActivityLevel(data.activityLevel || '');
          setHealthIssuesList(data.healthIssues || []);
        } else {
          console.warn("User details not found or server error");
        }
      } catch (error) {
        console.error("Failed to fetch user details", error);
      }
    };

    fetchUserDetails();
  }, [userId]);

  const renderActivityPicker = () => (
    <>
      <TouchableOpacity
        style={[styles.pickerButton]}
        onPress={() => setActivityModal(true)}
      >
        <Text>{activityLevel || "Select Activity Level"}</Text>
      </TouchableOpacity>

      <Modal visible={activityModal} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <FlatList
              data={activityOptions || []}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setActivityLevel(item);
                    setActivityModal(false);
                  }}
                >
                  <Text>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              onPress={() => setActivityModal(false)}
              style={{ padding: 10, alignSelf: "center" }}
            >
              <Text style={{ color: "red" }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>

  );

  const renderPicker = () => (
    <>
      <TouchableOpacity
        style={[styles.pickerButton, errors.state && styles.inputError]}
        onPress={() => setModalVisible(true)}
      >
        <Text>{state || 'Select a state'}</Text>
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <FlatList
              data={indianStates || []}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setState(item);
                    setModalVisible(false);
                  }}
                >
                  <Text>{item}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              onPress={() => setModalVisible(false)}
              style={{ padding: 10, alignSelf: 'center' }}
            >
              <Text style={{ color: 'red' }}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );

  return (
    <ImageBackground
      source={require('../assets/images/first_form.png')} // Update the path as per your project structure
      style={styles.background}
      resizeMode="cover"
    >
      <View contentContainerStyle={styles.container}>
        {renderProgress()}

        {page === 1 && (
          <View style={styles.page}>
            <Text style={styles.label}>Name:</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              value={name}
              onChangeText={setName}
            />
            <Text style={styles.note}>Let us know what we should call you.</Text>

            <Text style={styles.label}>Gender:</Text>
            <View style={styles.genderRow}>
              <TouchableOpacity
                style={[styles.genderBtn, gender === 'Male' && styles.selected]}
                onPress={() => setGender('Male')}
              >
                <Text>Male</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.genderBtn, gender === 'Female' && styles.selected]}
                onPress={() => setGender('Female')}
              >
                <Text>Female</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.note}>We use sex at birth and age to calculate an accurate goal for you.</Text>

            <Text style={styles.label}>Age:</Text>
            <TextInput
              style={[styles.input, errors.age && styles.inputError]}
              keyboardType='numeric'
              value={age}
              onChangeText={setAge}
            />
            <Text style={styles.note}>How old are you?</Text>
          </View>
        )}

        {page === 2 && (
          <View style={styles.page}>
            <Text style={styles.label}>Height (cm):</Text>
            <TextInput
              style={[styles.input, errors.height && styles.inputError]}
              keyboardType='numeric'
              value={height}
              onChangeText={setHeight}
            />
            <Text style={styles.note}>Knowing your height helps personalize your experience.</Text>

            <Text style={styles.label}>Weight (kg):</Text>
            <TextInput
              style={[styles.input, errors.weight && styles.inputError]}
              keyboardType='numeric'
              value={weight}
              onChangeText={setWeight}
            />
            <Text style={styles.note}>Used for BMI and calorie calculations.</Text>

            <Text style={styles.label}>Where do you live:</Text>
            <Text style={styles.note}>Choose your current location to tailor health insights.</Text>
            {renderPicker()}
          </View>
        )}

        {page === 3 && (
          <View style={styles.page}>
            <Text style={styles.label}>Sleep Hours:</Text>
            <TextInput
              style={[styles.input, errors.sleepHours && styles.inputError]}
              keyboardType='numeric'
              value={sleepHours}
              onChangeText={setSleepHours}
            />
            <Text style={styles.note}>Good sleep impacts your overall health and energy.</Text>

            <Text style={styles.label}>Activity Level:</Text>
            <Text style={styles.note}>Your daily activity helps calculate calorie burn.</Text>
            {renderActivityPicker()}


            <Text style={styles.label}>Health Issues:</Text>
            <Text style={styles.note}>Let us know any health issues to personalize your plan.</Text>
            <View style={styles.healthInputRow}>
              <TextInput
                style={[styles.input, { flex: 1 }]}
                value={healthIssue}
                onChangeText={setHealthIssue}
                placeholder='Enter issue'
              />
              <TouchableOpacity style={styles.addButton} onPress={addHealthIssue}>
                <Text style={{ color: 'white', fontWeight: 'bold' }}>Add</Text>
              </TouchableOpacity>
            </View>

            <FlatList
              data={healthIssuesList || []}
              keyExtractor={(item, index) => index.toString()}
              renderItem={({ item, index }) => (
                <View style={styles.issueRow}>
                  <Text style={styles.issueItem}>{item}</Text>
                  <TouchableOpacity onPress={() => removeHealthIssue(index)}>
                    <Text style={styles.removeIcon}>✖</Text>
                  </TouchableOpacity>
                </View>
              )}
            />

          </View>
        )}

        <View style={styles.navRow}>
          {page > 1 && (
            <TouchableOpacity style={styles.backButton} onPress={prevPage}>
              <Text style={{ fontSize: 18, color: "#fff" }}>← </Text>
            </TouchableOpacity>
          )}
          <TouchableOpacity style={styles.button} onPress={handleNext}>
            <Text style={styles.buttonText}>{page < 3 ? 'Next' : 'Submit'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  // ===== Container =====
  background: {
    flex: 1,
    width: '100%',
    height: '100%',
  },

  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingVertical: 30,
    justifyContent: 'center',
  },
  page: {
    height: '80%', width: '90%',
    marginLeft: '5%',
    borderRadius: '10px'
  },

  // ===== Progress Bar =====
  progressBar: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 45,
  },
  bar: {
    width: 100,
    height: 5,
    backgroundColor: 'white',
    marginHorizontal: 5,
    borderRadius: 5,
  },
  barActive: {
    backgroundColor: 'blue',
  },

  // ===== Labels and Notes =====
  label: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 22,
    color: '#353839'
  },
  note: {

    color: 'rgba(0, 0, 0, 0.8)',
    fontSize: 15,
    marginTop: 4
  },

  // ===== Inputs =====
  input: {
    borderWidth: 1,
    borderColor: 'blue',
    borderRadius: 6,
    padding: 10,
    marginTop: 10, marginRight: '10%'
  },
  inputError: {
    borderColor: 'red'
  },

  // ===== Gender Selection =====
  genderRow: {
    flexDirection: 'row',
    marginTop: 10
  },
  genderBtn: {
    padding: 10,
    borderWidth: 1,
    borderColor: 'blue',
    borderRadius: 6,
    marginRight: 10
  },
  selected: {
    backgroundColor: '#e0ffe0',
    borderColor: 'green'
  },

  // ===== Navigation Buttons =====
  navRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40
  },
  backButton: {
    justifyContent: 'center'
  },
  button: {
    backgroundColor: 'green',
    padding: 10,
    borderRadius: 6,
    position: 'absolute',
    right: 10,
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold'
  },

  // ===== Picker Button =====
  pickerButton: {
    borderWidth: 1,
    borderColor: 'blue',
    borderRadius: 6,
    padding: 12,
    marginTop: 10
  },

  // ===== Modal =====
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0,0,0,0.4)'
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 50,
    borderRadius: 8,
    padding: 40,
    maxHeight: '80%'
  },
  modalItem: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee'
  },

  // ===== Health Inputs =====
  healthInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10
  },
  addButton: {
    backgroundColor: 'green',
    padding: 10,
    marginLeft: 10,
    borderRadius: 6
  },
  issueItem: {
    padding: 5,
    backgroundColor: '#e6ffe6',
    borderRadius: 4,
    marginVertical: 2
  },
  issueItem: {
    padding: 5,
    backgroundColor: '#e6ffe6',
    borderRadius: 4,
    marginVertical: 2
  },
  issueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#e6ffe6',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 4,
    marginVertical: 2
  },
  removeIcon: {
    color: 'red',
    fontWeight: 'bold',
    fontSize: 18,
    marginLeft: 10
  }

});