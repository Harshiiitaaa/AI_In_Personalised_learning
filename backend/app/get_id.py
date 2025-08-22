from pymongo import MongoClient

# 1. Connect to your MongoDB database
client = MongoClient("mongodb://localhost:27017/")
db = client["dsa_with_ai"] # <-- Replace with your DB name
questions_collection = db["questions"]

# 2. Find one question in the collection
question = questions_collection.find_one()

# 3. Check if a question was found and print its ID
if question:
    question_id = str(question["_id"])
    print("Found Question ID:")
    print(question_id)
else:
    print("No questions found in the database.")

client.close()