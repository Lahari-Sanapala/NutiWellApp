

import requests
from config import GROQ_API_KEY
from flask import Flask

# MongoDB setup


# Groq API setup
API_URL = "https://api.groq.com/openai/v1/chat/completions"
HEADERS = {
    "Authorization": f"Bearer {GROQ_API_KEY}",
    "Content-Type": "application/json",
}

# Function to fetch data from MongoDB and convert it to list of dictionaries


def get_model_response(user_query, user_data=None):
    # Determine context phrasing based on whether user_data was successfully passed
    data_context = ""
    if user_data:
        data_context = f"""
    ### Your Patient's Profile & Current Status:
    You MUST tailor your advice to this exact person. Do not give generic advice.
    - Name: {user_data.get('userName', 'Unknown')}
    - Age/Gender: {user_data.get('age', 'Unknown')} {user_data.get('gender', '')}
    - Physical Traits: {user_data.get('height', 'Unknown')}cm, {user_data.get('weight', 'Unknown')}kg
    - Activity Level: {user_data.get('activityLevel', 'Unknown')}
    - Health Issues: {', '.join(user_data.get('healthIssues', [])) if user_data.get('healthIssues') else 'None reported'}
    - Last Night Sleep: {user_data.get('sleepHours', 'Unknown')} hours
    
    ### Their Dietary Limits (TDEE):
    {user_data.get('targetNutrition', 'Not calculated')}
    
    ### What they already ate TODAY:
    Totals so far: {user_data.get('totalNutrition', 'None')}
    Foods consumed: {', '.join(user_data.get('summaries', [])) if user_data.get('summaries') else 'Nothing yet today'}
    
    CRITICAL RULE: If the user asks about eating something (e.g. "Can I eat chicken for dinner?"), YOU MUST do the math. 
    Subtract their "Totals so far" from their "Dietary Limits" to see if they have enough calories/protein left for the requested food, and give a specific yes/no with reasoning!
    """

    prompt = f"""
    You are VitaBot, an extremely intelligent, personalized AI nutritionist and fitness coach.

    {data_context}

    ### Response Guidelines:
    1. Be conversational, friendly, and act as their personal dietician. Use their name.
    2. NEVER give generic boilerplate advice if you can calculate specific advice using their profile above.
    3. If they ask a dietary question (like "Is it good to eat chicken for dinner?"), always evaluate it against their specific caloric targets, remaining macros, and their current health issues.
    4. Keep answers relatively short, beautifully formatted, and highly actionable. No huge walls of text.
    5. If they ask about your creators, you were built by the Merines Team (Venkateswari Thota, Lahari Sanapala, Asiya Tabasum Shaik, Keerthi Budida, Pallavi Noundru) guided by Dr. Sadu Chiranjeevi Sir at IIIT-Nuzvid.

    User Query: {user_query}
    """

    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": [
            {"role": "system", "content": "You are VitaBot, an elite personal dietician AI. Use the provided user context to calculate precise nutritional conclusions."},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.5,
    }

    response = requests.post(API_URL, json=payload, headers=HEADERS)

    if response.status_code == 200:
        return response.json()["choices"][0]["message"]["content"]
    else:
        return f"Error: {response.status_code}, {response.text}"

def get_meal_analysis(meal_type, food_items):
    prompt = f"""
    The user is asking for an analysis of their {meal_type}. 
    They have consumed the following items:
    {food_items}

    Please provide a concise and highly encouraging nutritional analysis for this {meal_type}.
    - Is this a balanced {meal_type}?
    - If there are too many carbs, fats, or low protein, gently point it out.
    - Provide 2-3 bullet points of simple suggestions for improvement.
    
    Keep the tone friendly, helpful, and strictly medical/nutritional. Keep the response to 4-6 short paragraphs/bullet points max.
    """

    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": [
            {"role": "system", "content": "You are VitaBot, a knowledgeable AI health and dietician assistant."},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.5,
    }

    response = requests.post(API_URL, json=payload, headers=HEADERS)

    if response.status_code == 200:
        return response.json()["choices"][0]["message"]["content"]
    else:
        return f"Error: {response.status_code}, {response.text}"