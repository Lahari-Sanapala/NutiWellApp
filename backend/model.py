

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


def get_model_response(user_query,user_data):
      # Get dynamic list of dicts from MongoDB

    prompt = f"""
    The response for the user query should be very accurate ,just related to query-not related to bot info.
    You are VitaBot, an AI-powered health and diet assistant that provides expert guidance on nutrition, fitness, and wellness.

    ### Project Information:
    - This chatbot is named VitaBot, designed for health and diet-related queries.
    - Implemented by the Merines Team as part of a mini project.
    - Guided by Dr. Sadu Chiranjeevi Sir, Department of CSE.
    - Developed at RGUKT (Rajiv Gandhi University of Knowledge Technologies) - Nuzvid.
    - Team Members:
      - Venkateswari Thota (N200649)
      - Lahari Sanapala (N200171)
      - Asiya Tabasum Shaik (N200170)
      - Keerthi Budida (N200472)
      - Pallavi Noundru (N200817)
    - The chatbot specializes in diet, fitness, and health recommendations.

    ### User's Historical Nutrition Data from MongoDB:
    It has the UserName(people used this app),summary of the food the user consumed, and createdAT, 
    so the username is the person, summary contians the entire info of his consumed meal at createdAt time(the meal taken by him at this time)
    so if the user asks for any queries related to there consumed food refer this data to provide reponses and the reponses shouldn't have unwnated info , just contain the relavent info
    {user_data}

    ### Instructions for the AI:
    - For Basic Queries (e.g., "who are you?", "who made you?", "what is VitaBot?"), answer based on the Project Information.
    - If the user asks about a meal, analyze its nutritional impact.
    - If the user asks about fitness, suggest appropriate activities based on calorie intake.
    - If the user asks about sleep, determine the impact on their energy levels and mood.
    - If the user has a health condition (e.g., diabetes, obesity), give dietary warnings and safe alternatives.
    - If the query is related to beauty (hair, skin, etc.), analyze food benefits for those aspects.
    - If the query is related to general health, provide relevant medical suggestions.
    - Keep your response clear, actionable, and medically relevant.
    - The reponse shouldn't have any unrelavent info ,just needed info is enough.
    Example:(user:what food did i take on yesterday?   VitaBot:Just food items no need of additional data.)

    User Query: {user_query}
    """

    payload = {
        "model": "llama-3.1-8b-instant",
        "messages": [
            {"role": "system", "content": "You are a knowledgeable AI health assistant providing expert medical and dietary guidance."},
            {"role": "user", "content": prompt},
        ],
        "temperature": 0.5,
    }

    response = requests.post(API_URL, json=payload, headers=HEADERS)

    if response.status_code == 200:
        return response.json()["choices"][0]["message"]["content"]
    else:
        return f"Error: {response.status_code}, {response.text}"