import React, { useState } from "react";
import { View, TextInput, Button, Text, StyleSheet } from "react-native";
import Constants from "expo-constants";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const baseURL = Constants.expoConfig.extra.BASE_URL;

  const handleLogin = async () => {
    try {
      const res = await fetch(`http://192.168.1.27:3000/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        alert("Login successful!");
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <View style={styles.form}>
      <Text style={styles.title}>Login</Text>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}

const styles = StyleSheet.create({
  form: { gap: 10 },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 10 },
  input: { borderWidth: 1, borderColor: "#ccc", borderRadius: 6, padding: 10 },
});
