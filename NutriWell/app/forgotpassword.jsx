import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import Constants from "expo-constants";


export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const baseURL = Constants.expoConfig.extra.BASE_URL;

  const handleForgotPassword = async () => {
    if (!email) {
      setErrorMessage('Please enter your email');
      setMessage('');
      return;
    }

    try {
      const res = await fetch(`${baseURL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.message || 'Failed to send reset link.');
        setMessage('');
        return;
      }

      setMessage('Mail sent correctly. Please check your inbox.');
      setErrorMessage('');
      console.log("message", data.message);
      
      Alert.alert('Success', 'Mail sent correctly. Please check your inbox.');

      // Optional redirect after 5 seconds
      setTimeout(() => {
        router.push('/signup');
      }, 5000);
    } catch (error) {
      console.error('Forgot password error', error);
      setErrorMessage('Failed to send reset link. Please try again.');
      setMessage('');
    }
  };

  return (
    <View style={styles.container}>
      {/* Back button */}
      <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
        <Ionicons name="arrow-back" size={24} color="#2F4F4F" />
      </TouchableOpacity>

      <Text style={styles.title}>Forgot Password</Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />

      {message ? <Text style={[styles.message, { color: 'green' }]}>{message}</Text> : null}
      {errorMessage ? <Text style={[styles.message, { color: 'red' }]}>{errorMessage}</Text> : null}

      <TouchableOpacity style={styles.button} onPress={handleForgotPassword}>
        <Text style={styles.buttonText}>Send Reset Link</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8ede1ff',
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
    color: '#2F4F4F',
  },
  input: {
    backgroundColor: '#f0f2f5',
    padding: 12,
    borderRadius: 10,
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#2F4F4F',
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
    marginBottom: 10,
  },
});
