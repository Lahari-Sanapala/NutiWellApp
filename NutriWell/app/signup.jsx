
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons'; // For eye icon
import logo from '../assets/images/logo.jpg';
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";



export default function AuthScreen() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const baseURL = Constants.expoConfig.extra.BASE_URL;

  const handleAuth = async () => {
    if (!email || !password || (!isLogin && !fullName)) {
      setError('Please fill all fields');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      const endpoint = isLogin
        ? "http://192.168.138.205:3000/api/auth/login"
        : "http://192.168.138.205:3000/api/auth/signup";

      const payload = isLogin
        ? { email, password }
        : { fullName, email, password };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const text = await res.text();
      //console.log("📦 Raw server response:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch (err) {
        console.error("❌ Failed to parse JSON:", err);
        setError("Server error — not returning JSON");
        return;
      }

      if (!res.ok) {
        setError(data.message || 'Something went wrong');
        return;
      }

      console.log('✅ Auth Success:', data.user);

      // ✅ Save full user data in context + AsyncStorage
      if (data?.user) {
        console.log("🌍 User logged in globally:", data);
        const userId = data.user._id.toString();
        console.log("user id in signup.jsx", userId)

        await AsyncStorage.setItem("userId", userId);
        const storedId = await AsyncStorage.getItem("userId");
        console.log("📦 Stored user ID in string in signup:", storedId);
      }



      // Navigate based on login/signup
      router.replace(isLogin ? "/Intro" : "/details");

    } catch (err) {
      setError('Network error. Please try again later.');
      console.error('❌ Error:', err);
    }
  };


  return (
    <View style={styles.container}>

      <View style={styles.authBox}>
        <Text style={styles.title}>{isLogin ? 'Welcome User' : 'Create Account'}</Text>
        <Text style={styles.subtitle}>
          {isLogin ? 'Sign in to continue' : 'Sign up to get started'}
        </Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        {!isLogin && (
          <TextInput
            style={styles.input}
            placeholder="Full Name"
            value={fullName}
            onChangeText={setFullName}
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="Email"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <View style={styles.passwordContainer}>
          <TextInput
            style={[styles.input, { flex: 1 }]}
            placeholder="Password"
            secureTextEntry={!showPassword}
            value={password}
            onChangeText={setPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Ionicons
              name={showPassword ? 'eye' : 'eye-off'}
              size={22}
              color="#888"
              style={{ marginRight: 10 }}
            />
          </TouchableOpacity>
        </View>

        {isLogin && (
          <TouchableOpacity onPress={() => router.push("/forgotpassword")}>
            <Text style={styles.forgot}>Forgot Password ?</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity style={styles.button} onPress={handleAuth}>
          <Text style={styles.buttonText}>{isLogin ? 'SIGN IN' : 'SIGN UP'}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setIsLogin(!isLogin)}>
          <Text style={styles.switch}>
            {isLogin ? "Don't have an account? Sign up" : 'Already have an account? Sign in'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// 💅 Styles remain same
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8ede1ff',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    marginBottom: 20,

  },
  authBox: {
    backgroundColor: '#fff',
    width: '100%',
    padding: 25,
    borderRadius: 16,
    shadowColor: '#aaa',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 4,
    textAlign: 'center',
    color: '#2F4F4F',
  },
  subtitle: {
    fontSize: 15,
    color: '#555',
    marginBottom: 20,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#f0f2f5',
    padding: 12,
    marginBottom: 12,
    borderRadius: 10,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f2f5',
    borderRadius: 10,
    marginBottom: 12,
  },
  forgot: {
    color: '#2F4F4F',
    alignSelf: 'flex-end',
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#2F4F4F',
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  switch: {
    color: '#2F4F4F',
    textAlign: 'center',
    marginTop: 10,
  },
  error: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },
});





