# 🥗 NutriWell - Smart AI Diet & Health Assistant

**NutriWell** is an intelligent, multi-modal React Native application designed to seamlessly track your daily nutrition, optimize your habits, and provide actionable health insights using advanced AI (Google Gemini & LLaMA 3). By automating meal scanning and providing gamified tracking, NutriWell eliminates the friction of traditional calorie counting.

---

## ✨ Core Features

*   **📸 AI Image Nutrition Tracking:** Don't type your food—just snap a picture! NutriWell leverages Google's Gemini 2.5 Flash Vision models to visually identify the items on your plate and seamlessly extract macro estimates.
*   **🔢 Automated Scoring & Macro Extraction:** Once the food is identified, Llama-3-instant (via Groq) algorithmically scores your meals out of 10 and dynamically categorizes your Protein, Fat, and Carbs automatically into High/Low/Moderate balances.
*   **🏃 Activity-Based Calorie Estimation:** Natively calculates your Total Daily Energy Expenditure (TDEE) and dynamically estimates personalized calorie thresholds based on your explicit activity levels (Sedentary, Active, etc.) and bodily metrics.
*   **🍽️ Meal-Wise Analysis:** Intelligently tags and contextualizes your logs depending on the meal type (Breakfast, Lunch, Dinner, Snack), separating macro insights per specific plate for granular review.
*   **🤖 VitaBot Chatbot:** Your on-demand, specialized in-app virtual nutritionist that provides precise, real-time diet analysis and general wellness advice.
*   **🔥 Gamified Streaks:** Automatically tracks continuous days of food logging to help build long-term consistency. Keep your streak alive!
*   **📊 Weekly Analytics Report:** Beautiful, native Line & Bar charts mapping your 7-day chronological trends for Calories and Protein consistency, explicitly highlighting unlogged (missed) days.
*   **💧 Water Tracker:** Dedicated hydration UI to quickly add/remove consumed glasses, synced perfectly to standard temporal midnights.
*   **🧠 Intelligent Notification Engine:** A background-scheduled notification processor that dynamically pushes ~15-20 wellness alerts per day. It natively calculates when to remind you about missed meals (if it's 3 PM and you forgot lunch), warns you about extreme local weather changes, and randomly provides mental/diet tips so you stay motivated!

---

## 🛠️ The Technology Stack

**Frontend (Mobile App)**
*   **Framework:** React Native / Expo (`expo-router`)
*   **UI/UX:** `react-native-safe-area-context`, `react-native-chart-kit` (Analytics Graphs), FontAwesome
*   **Local Storage:** `@react-native-async-storage/async-storage`

**Backend (Microservice Architecture)**
*   **Primary API Server:** Node.js, Express.js (Port `3000`)
*   **Database:** MongoDB via `mongoose`
*   **Notification Scheduler Engine:** Node.js, `node-cron` alternative processor (Port `6001`)

**AI Processors (Python Flask)**
*   **Multi-modal Analyzer (`sample.py`):** Flask, Google `generativeai` (Gemini 2.5 Flash), Groq API (Llama 3.1 8B), Python `PIL` for base64 image decoding (Port `8501`).
*   **Conversational Agent (`app.py`):** Flask (Port `5001`)

---

## 🚀 How to Run Locally

Because NutriWell utilizes a robust microservice architecture for scale, you must start up the individual service layers for the app to function properly.

### 1. Database & Environment Prep
*   Ensure **MongoDB** is running locally or you have a valid Atlas cloud cluster.
*   Create a `.env` file in the `backend/` directory referencing your API Keys:
    ```env
    MONGO_URI=mongodb://127.0.0.1:27017/NutriWell
    API_KEY=<Your_Groq_API_Key>
    API_KEYY=<Your_Gemini_API_Key>
    GROQ_API_URL=https://api.groq.com/openai/v1/chat/completions
    ```

### 2. Booting the Node APIs
Open two separate terminal windows in the `/backend` directory:
```bash
# Terminal A (Main CRUD API)
npm install
node server.js

# Terminal B (Smart Notification Engine)
node serverr.js
```

### 3. Booting the Python AI Engines
Open two separate terminal windows in the `/backend` directory:
```bash
# Ensure Python dependencies are installed (pip install -r requirements.txt)

# Terminal C (Food Vision & Scoring Service)
python sample.py

# Terminal D (VitaBot Assistant)
python app.py
```

### 4. Launching the App
Open a final terminal in the `/NutriWell` frontend directory:
```bash
npm install
npx expo start
```
*Press `i` in the terminal to launch the iOS simulator or scan the QR code using Expo Go on your physical test device!*

---

## 🕰️ Timezone Consistency Note
NutriWell's data aggregation engines and notification limits are explicitly locked to **India Standard Time (`Asia/Kolkata`)** boundaries. This guarantees that your water tracker and weekly calorie graphs correctly roll over at your specific midnight, preventing data from drifting retroactively due to UTC localization issues.