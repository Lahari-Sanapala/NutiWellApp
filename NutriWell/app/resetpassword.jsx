import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter, useLocalSearchParams } from 'expo-router';
import Constants from "expo-constants";


export default function ResetPassword() {
  const router = useRouter();
  const { email, token } = useLocalSearchParams(); // grab email & token from URL
  const [newPassword, setNewPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const baseURL = Constants.expoConfig.extra.BASE_URL;

  const handleReset = async () => {
    if (!email || !token || !newPassword) {
      setMessage('Missing email, token, or password');
      return;
    }

    try {
      const res = await fetch(`http://192.168.138.205:3000/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Password reset successfully!');
        setTimeout(() => router.replace('/login'), 1500);
      } else {
        setMessage(data.message || 'Reset failed');
      }
    } catch (err) {
      console.error(err);
      setMessage('Something went wrong');
    }
  };

  return (
    <View style={styles.container}>
      {/* Back button */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={24} color="#6C63FF" />
      </TouchableOpacity>

      <Text style={styles.title}>Reset Password</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter New Password"
        value={newPassword}
        onChangeText={setNewPassword}
        secureTextEntry={!showPassword}
      />

      <View style={styles.checkboxContainer}>
        <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.checkbox}>
          <Ionicons
            name={showPassword ? 'eye' : 'eye-off'}
            size={20}
            color="#6C63FF"
          />
          <Text style={styles.checkboxLabel}> Show Password</Text>
        </TouchableOpacity>
      </View>

      {message ? <Text style={styles.message}>{message}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleReset}>
        <Text style={styles.buttonText}>Update Password</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#BEAFDA',
    padding: 20,
    justifyContent: 'center',
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#f0f2f5',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  checkboxContainer: {
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkboxLabel: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
  },
  button: {
    backgroundColor: '#6C63FF',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  message: {
    textAlign: 'center',
    color: '#333',
    marginBottom: 10,
  },
});
