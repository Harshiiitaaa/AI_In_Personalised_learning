import pandas as pd
from pymongo import MongoClient
import json

def import_questions_from_csv(csv_path):
    """
    Reads questions from a CSV file and inserts them into a MongoDB collection.
    """
    # --- 1. CONNECT TO MONGODB ---
    # Update this connection string if your database is not on your local machine
    client = MongoClient('mongodb://localhost:27017/')
    
    # --- IMPORTANT: Change these names to match your project ---
    DATABASE_NAME = "leetcode_dataset.csv"      # 👈 Replace with your database name
    COLLECTION_NAME = "questions"  # 👈 Replace with your collection name
    
    db = client[DATABASE_NAME]
    collection = db[COLLECTION_NAME]
    
    print(f"✅ Connected to MongoDB. Using database '{DATABASE_NAME}' and collection '{COLLECTION_NAME}'.")

    try:
        # --- 2. READ THE CSV FILE ---
        # This uses pandas to read your csv into a structured format (a DataFrame)
        df = pd.read_csv(csv_path)
        
        # Convert the DataFrame to a list of dictionaries (which is what MongoDB needs)
        records = json.loads(df.to_json(orient='records'))
        
        print(f"📄 Found {len(records)} records in the CSV file.")

        # --- 3. INSERT THE DATA ---
        if records:
            # First, delete any existing data in the collection to avoid duplicates
            collection.delete_many({})
            print("🧹 Cleared existing data from the collection.")
            
            # Insert the new records from the CSV
            collection.insert_many(records)
            print(f"🎉 Successfully inserted {len(records)} questions into the database!")
        else:
            print("⚠️ The CSV file is empty or could not be read. No data was inserted.")

    except FileNotFoundError:
        print(f"❌ ERROR: The file '{csv_path}' was not found. Make sure it's in the same directory.")
    except Exception as e:
        print(f"❌ An error occurred: {e}")
    finally:
        # --- 4. CLOSE THE CONNECTION ---
        client.close()
        print("🔗 Connection to MongoDB closed.")

# --- RUN THE SCRIPT ---
if __name__ == '__main__':
    # Make sure your CSV file is named 'questions.csv' and is in the same folder
    csv_file_path = 'questions.csv'
    import_questions_from_csv(csv_file_path)