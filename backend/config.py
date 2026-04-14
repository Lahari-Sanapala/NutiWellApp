import os
from dotenv import load_dotenv

load_dotenv()  # loads the .env file

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
