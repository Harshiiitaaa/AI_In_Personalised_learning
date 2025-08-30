import os
import time
from pymongo import MongoClient
from dotenv import load_dotenv

# --- Configuration ---
# Make sure your .env file in the 'backend' folder has these variables
load_dotenv()
MONGO_URL = os.getenv("MONGO_URL", "mongodb://localhost:27017/")
MONGO_DB = os.getenv("MONGO_DB_NAME", "dsa_with_ai")
TEST_EMAIL = "garg2004harshita@gmail.com"  # 👈 *** IMPORTANT: Change this to an email that ACTUALLY EXISTS in your users collection ***

# --- Main Debug Function ---
def debug_login_query():
    """
    Connects to the database and analyzes the performance of the login query.
    """
    print("--- Database Performance Debugger ---")
    
    try:
        client = MongoClient(MONGO_URL)
        db = client[MONGO_DB]
        users_collection = db.users
        print(f"✅ Successfully connected to MongoDB database: '{MONGO_DB}'")
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        return

    print(f"\n🔍 Analyzing query: users.find_one({{'email': '{TEST_EMAIL}'}})")
    
    try:
        # Get the execution plan (the "explain" result)
        explain_plan = users_collection.find({"email": TEST_EMAIL}).explain()
        
        # Time the actual query
        start_time = time.time()
        user = users_collection.find_one({"email": TEST_EMAIL})
        end_time = time.time()
        
        duration = (end_time - start_time) * 1000  # in milliseconds

        if user:
            print(f"✅ Query successful: Found user '{user.get('username')}'")
        else:
            print("⚠️ Query successful, but no user was found with that email.")

        print(f"⏱️  Query took: {duration:.2f} ms")

        # --- Analyze the Plan ---
        print("\n--- Execution Plan Analysis ---")
        winning_stage = explain_plan.get("queryPlanner", {}).get("winningPlan", {}).get("inputStage", {})
        stage_type = winning_stage.get("stage")

        if stage_type == "IXSCAN":
            index_name = winning_stage.get("indexName")
            print(f"🎉 SUCCESS: The query is using the index '{index_name}'.")
            print("This means your database is fast. The slowness is somewhere else in the Python code.")
        elif stage_type == "COLLSCAN":
            print(f"❌ PROBLEM FOUND: The query is using a 'COLLSCAN' (Collection Scan).")
            print("This means the database is reading every document and NOT using your index. This is the cause of the slowness.")
            print("Please double-check that you created the index on the correct 'users' collection and the 'email' field.")
        else:
            print(f"🤔 Unknown stage type: {stage_type}. Please review the full plan below.")
            print(explain_plan)

    except Exception as e:
        print(f"❌ An error occurred during the query: {e}")
    finally:
        client.close()
        print("\nConnection closed. Debug finished.")

if __name__ == "__main__":
    debug_login_query()
    
