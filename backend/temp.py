# from pymongo import MongoClient

# # Connect
# client = MongoClient("mongodb+srv://laharisanapala2005:Lahari1234@nutriwell.hdpzqyk.mongodb.net/nutriwellDB?retryWrites=true&w=majority&appName=NutriWell")

# # Select database and collection
# db = client['nutriwellDB']
# collection = db['userdetails']

# # Fetch all documents
# for doc in collection.find():
#     print(doc)

from pymongo import MongoClient
from pprint import pprint  # for better formatting

# ---------------------------
# Connect to MongoDB
# ---------------------------
client = MongoClient(
    "mongodb+srv://laharisanapala2005:Lahari1234@nutriwell.hdpzqyk.mongodb.net/"
    "nutriwellDB?retryWrites=true&w=majority&appName=NutriWell"
)

db = client['nutriwellDB']
collection = db['userdetails']

# ---------------------------
# Fetch only the 'food' field from all users
# ---------------------------
all_foods = []

for doc in collection.find({}, {"food": 1, "_id": 0}):
    # 'doc' will look like: {"food": [ ... ]}
    foods = doc.get("food", [])
    all_foods.extend(foods)  # add to the flat list

# ---------------------------
# Print all food entries
# ---------------------------
for idx, food in enumerate(all_foods, start=1):
    print(f"Food Entry #{idx}:")
    pprint(food)
    print("-" * 50)
