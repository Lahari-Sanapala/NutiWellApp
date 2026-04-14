import React, { useState, useRef, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from "expo-constants";

export default function Chatbot() {
  const [query, setQuery] = useState("");
  const [chats, setChats] = useState([]);
  const scrollViewRef = useRef();
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const baseURL = Constants.expoConfig.extra.BASE_URL || "http://10.33.15.69:3000";

  const getTodayString = () => {
    return new Date().toLocaleDateString('en-CA');
  };

  useEffect(() => {
    const fetchData = async () => {
      const storedId = await AsyncStorage.getItem("userId");
      if (storedId) {
        setUserId(storedId);
      }
    };
    fetchData();
  }, []);

  // --- Load Daily Chat History ---
  useEffect(() => {
    const loadHistory = async () => {
      if (!userId) return;
      try {
        const historyJson = await AsyncStorage.getItem(`chatHistory_${userId}`);
        if (historyJson) {
          const historyData = JSON.parse(historyJson);
          if (historyData.date === getTodayString()) {
            setChats(historyData.messages || []);
          } else {
            // New day, start fresh
            setChats([]);
            await AsyncStorage.removeItem(`chatHistory_${userId}`);
          }
        }
      } catch (e) {
        console.error("Failed to load chat history", e);
      }
    };
    loadHistory();
  }, [userId]);

  // --- Save Chat History (whenever chats array updates) ---
  useEffect(() => {
    const saveHistory = async () => {
      if (!userId || chats.length === 0) return;
      try {
        const dataToSave = {
          date: getTodayString(),
          messages: chats
        };
        await AsyncStorage.setItem(`chatHistory_${userId}`, JSON.stringify(dataToSave));
      } catch (e) {
        console.error("Failed to save chat history", e);
      }
    };
    saveHistory();
  }, [chats, userId]);

  const fetchAndSendToChatbot = async () => {
    const trimmedQuery = query.trim();
    if (!trimmedQuery) return; // Ensure there's a query to send

    const userChat = { user: "User", text: trimmedQuery };

    // Clear the input first
    setQuery("");

    // Add user query to chat history
    setChats((prevChats) => [...prevChats, userChat]);

    try {
      // 1. Fetch today's meals and full nutrition profile from Node.js backend
      const response = await fetch(`${baseURL}/api/details/${userId}/getTodaysMealsAndNutrition`);
      const mealData = await response.json(); 

      // 2. Send it to the Flask chatbot server
      const chatbotResponse = await axios.post("http://10.33.15.69:5001/chatbot", {
        userData: mealData,
        query: trimmedQuery,
      });

      // Add chatbot response to chat history
      const botChat = { user: "VitaBot", text: chatbotResponse.data.response };
      setChats((prevChats) => [...prevChats, botChat]);

    } catch (err) {
      console.error("Error fetching or sending data:", err);
      const errorChat = { user: "VitaBot", text: "Something went wrong fetching data." };
      setChats((prevChats) => [...prevChats, errorChat]);
    }
  };

  useEffect(() => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  }, [chats]);

  // Parse Markdown visually
  function parseSummary(summary) {
    if (!summary) return null;

    const lines = summary.split('\n');

    return lines.map((line, index) => {
      let formattedLine = line.replace(/^\s*\*\s+/g, "• ");
      formattedLine = formattedLine.replace(/(?<!\*)\*(?!\*)/g, "");

      const parts = formattedLine.split(/(\*\*[^*]+\*\*)/g);

      return (
        <Text key={index} style={{ marginBottom: 4 }}>
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color='#2F4F4F' />
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.header}>VitaBot</Text>
      </View>

      <ScrollView
        style={styles.chatBox}
        ref={scrollViewRef}
        contentContainerStyle={{ paddingBottom: 10 }}
      >
        {chats.length === 0 && (
          <Text style={styles.placeholderText}>Start chatting with VitaBot!</Text>
        )}
        
        {chats.map((chat, index) => (
          <View
            key={index}
            style={[
              styles.messageBubble,
              chat.user === "VitaBot" ? styles.bot : styles.user,
            ]}
          >
            {chat.user === "VitaBot" ? (
              <View style={styles.messageTextContainer}>
                {parseSummary(chat.text)}
              </View>
            ) : (
              <Text style={styles.messageTextUser}>{chat.text}</Text>
            )}
          </View>
        ))}
      </ScrollView>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.inputContainer}
      >
        <TextInput
          style={styles.input}
          value={query}
          onChangeText={(text) => setQuery(text)}
          placeholder="Ask me..."
          onSubmitEditing={fetchAndSendToChatbot}
          returnKeyType="send"
          blurOnSubmit={true}
          multiline={false}
        />
        <TouchableOpacity onPress={fetchAndSendToChatbot} style={styles.sendButton}>
          <Text style={styles.sendButtonText}>➤</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8ede1ff',
  },
  headerContainer: {
    paddingHorizontal: 16,
    paddingTop: 10,
    backgroundColor: '#f8ede1ff',
  },
  backButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  backText: {
    marginLeft: 6,
    color: '#2F4F4F',
    fontWeight: "600",
    fontSize: 16,
  },
  header: {
    textAlign: "center",
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: -10,
    color: '#2F4F4F',
  },
  chatBox: {
    flex: 1,
    backgroundColor: '#f8ede1ff',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  messageBubble: {
    padding: 12,
    borderRadius: 12,
    maxWidth: "85%",
    marginBottom: 10,
  },
  user: {
    alignSelf: "flex-end",
    backgroundColor: '#2F4F4F',
  },
  bot: {
    alignSelf: "flex-start",
    backgroundColor: '#dbf0f0ff',
  },
  messageTextUser: {
    fontSize: 15,
    lineHeight: 22,
    color: "white",
  },
  messageTextContainer: {
    color: "black",
  },
  placeholderText: {
    textAlign: 'center',
    marginTop: 20,
    color: '#aaa',
    fontStyle: 'italic',
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    paddingBottom: Platform.OS === 'ios' ? 0 : 16,
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: '#2F4F4F',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: "white",
    fontSize: 18,
  },
});