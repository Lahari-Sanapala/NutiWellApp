# health_bot.py
from flask import Flask, request, jsonify
from flask_cors import CORS
from model import get_model_response
from responses import predefined_responses
import re

app = Flask(__name__)  # ✅ Corrected "__name__"
CORS(app)  # Allow cross-origin requests from React Native frontend

@app.route('/')
def home():
    return "Flask backend is running!"  


@app.route("/chatbot", methods=["POST"])
def chatbot():
    data = request.get_json()
    print("data in app.py",data);
    user_data = data.get("userData")  # Getting mealData (if present)
    print("user data in app.py",user_data);
    user_query = data.get("query", "").strip()  # Extract query
    print("query in app.py",user_query)
    # Check if there's query and user_data
    if not user_query:
        return jsonify({"error": "Missing query"}), 400
    
    # First check for predefined responses based on the query
    for pattern, response in predefined_responses.items():
        if re.search(pattern, user_query, re.IGNORECASE):
            return jsonify({"response": response})  # Return predefined response

    # If no predefined response, process the query further with meal data if available
    if user_data:
        response = get_model_response(user_query, user_data)
    else:
        response = get_model_response(user_query)

    return jsonify({"response": response})

if __name__ == '__main__':  # ✅ Corrected "__name__" and "__main__"
    app.run(host="0.0.0.0", port=5001, debug=True)  # ✅ Use 0.0.0.0 to make it visible to other devices
