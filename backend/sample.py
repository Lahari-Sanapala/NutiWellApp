from flask import Flask, request, jsonify
from flask_cors import CORS
#from google.genai import Client
import google.generativeai as genai
from PIL import Image, UnidentifiedImageError
import base64, io, traceback, os
from dotenv import load_dotenv
from pymongo import MongoClient
from bson.objectid import ObjectId
import requests
import json


# Load env variables
load_dotenv()
api_key = os.getenv("API_KEY")
api_keyy = os.getenv("API_KEYY")
genai.configure(api_key=api_keyy)
model = genai.GenerativeModel("gemini-2.5-flash")
groq_api_url = os.getenv("GROQ_API_URL")

# MongoDB setup
mongo_uri = os.getenv("MONGO_URI")
mongo_client = MongoClient(mongo_uri)
db = mongo_client.get_database("NutriWell")
user_details_collection = db["userdetails"]

app = Flask(__name__)
CORS(app)

# ✅ Nutrition prompt (same as test.py)
input_prompt = """
You are a professional nutritionist. Analyze the meal in the image and respond with:

You are a professional nutritionist. Analyze the meal in the image and respond based on the user's personal details.

User Details:
- Name: {name}
- Age: {age}
- Gender: {gender}
- Height: {height} cm
- Weight: {weight} kg
- Sleep Hours: {sleepHours} hrs
- Health Issues: {healthIssues}
- Activity Level: {activityLevel}
- Meal Type: {mealType}


Before starting the numbered points, provide a single clean line starting with:
"Meal Analysis: <exact meal name>"

1. Identify the name of the overall meal or dish.
2. List individual food items present in the image.
3. Estimated total nutritional values for the full meal:
   - Calories (in cal)
   - Carbohydrates (grams)
   - Proteins (grams)
   - Fats (grams)
   - Key Vitamins (if visually identifiable)

4. Health impact insights:
    - Weight Management 
    - Skin Health 
    - Hair Health 
    - Sleep Quality 
    - General Wellness

5. Improvement Suggestions: Provide **3–5 short bullet points**, each **a single actionable suggestion**, no long explanations.
"""
@app.route('/analyze', methods=['POST'])
def analyze():
    try:
        data = request.get_json()
        base64_image = data.get("base64Image")
        user_id = data.get("userId")  # New: send userId from frontend
        meal_type = data.get("mealType", "General")

        if not base64_image or not user_id:
            return jsonify({"error": "Image or User ID missing"}), 400

        # Fetch user details from DB
        user_details = user_details_collection.find_one({"userId": ObjectId(user_id)})

        if not user_details:
            return jsonify({"error": "User not found"}), 404

        # Build the prompt including user details
        user_info = {
            "name": user_details.get("name", ""),
            "age": user_details.get("age", ""),
            "gender": user_details.get("gender", ""),
            "height": user_details.get("height", ""),
            "weight": user_details.get("weight", ""),
            "sleepHours": user_details.get("sleepHours", ""),
            "activityLevel": user_details.get("activityLevel", ""),
            "healthIssues": ", ".join(user_details.get("healthIssues", [])),
            "mealType": meal_type
        }

        prompt = input_prompt.format(**user_info)

        # Decode image
        if base64_image.startswith("data:image"):
            base64_image = base64_image.split(",")[1]
        image_bytes = base64.b64decode(base64_image)
        Image.open(io.BytesIO(image_bytes))  # Validate

        # Send to LLM
        response = model.generate_content([
            prompt,
            Image.open(io.BytesIO(image_bytes))
        ])

        summary_text = response.candidates[0].content.parts[0].text
        return jsonify({"summary": summary_text})

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

def calculate_score(calories, carbs, protein, fat, tdee):
    score = 10

    if fat > 30:
        score -= 2
    if protein < 15:
        score -= 2
    if carbs > 80:
        score -= 1
    if calories > (tdee / 3):
        score -= 2

    return max(score, 1)  # keep minimum 1

@app.route('/analyzeCalorie', methods=['POST'])
def analyzeCalorie():
    try:
        print("🔹 [INFO] Received /analyzeCalorie request")
        data = request.get_json()
        text = data.get('summary')
        user_id = data.get('userId')   

        user_details = None
        tdee = 2000  # default

        if user_id:
            try:
                user_details = user_details_collection.find_one({"userId": ObjectId(user_id)})
                if user_details:
                    tdee = user_details.get("tdee", 2000)   # ✅ safer
            except:
                print("⚠️ Invalid userId, using default TDEE")   

        prompt = (
            "You are a nutrition assistant.\n"
            "Extract CALORIES, CARBS, PROTEIN, FAT from the following summary.\n"
            "Return ONLY in this JSON format:\n\n"
            "{ \"calories\": number, \"carbs\": number, \"protein\": number, \"fat\": number }\n\n"
            "NO explanation. NO extra text. NO emojis.\n"
            f"Summary:\n{text}"
        )

        payload = {
            "model": "llama-3.1-8b-instant",
            "messages": [
                {"role": "system", "content": "Output only strict JSON. No extra text."},
                {"role": "user", "content": prompt}
            ],
            "temperature": 0.2,
            "max_tokens": 100
        }

        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {api_key}"
        }

        response = requests.post(groq_api_url, headers=headers, json=payload)

        if response.status_code == 200:
            result = response.json()
            generated_text = result.get("choices", [{}])[0].get("message", {}).get("content", "{}")

            print("🔍 Raw LLM Response:", generated_text)

            # Remove non-JSON text safely
            start = generated_text.find("{")
            end = generated_text.rfind("}") + 1
            json_text = generated_text[start:end]

            print("🧹 Cleaned JSON Extract:", json_text)

            try:
                nutrient_data = json.loads(json_text)
            except:
                print("⚠️ JSON parse failed — using fallback zeros")
                nutrient_data = {
                    "calories": 0,
                    "carbs": 0,
                    "protein": 0,
                    "fat": 0
                }

            # ✅ ALWAYS calculate score (OUTSIDE try)
            score = calculate_score(
                nutrient_data.get("calories", 0),
                nutrient_data.get("carbs", 0),
                nutrient_data.get("protein", 0),
                nutrient_data.get("fat", 0),
                tdee
            )

            final_summary = f"⭐ Food Quality Score: {score}/10\n\n{text.strip()}"

            print("✅ SCORE:", score)

            return jsonify({
                "food": {
                    "calories": nutrient_data.get("calories", 0),
                    "carbs": nutrient_data.get("carbs", 0),
                    "protein": nutrient_data.get("protein", 0),
                    "fat": nutrient_data.get("fat", 0),
                    "score": score,
                    "summary": final_summary
                }
            })

        else:
            print("❌ Groq API error:", response.text)
            return jsonify({"error": response.text}), response.status_code

    except Exception as e:
        print("❌ [EXCEPTION] in /analyzeCalorie:", str(e))
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


if __name__ == '__main__':
    print("🚀 Flask server starting on http://0.0.0.0:8501 ...")
    app.run(host="0.0.0.0", port=8501, debug=True)