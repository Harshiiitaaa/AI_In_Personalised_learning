import pandas as pd
from pymongo import MongoClient
import json
from pathlib import Path
import sys

# CORRECTED: Import settings for configuration
try:
    from config import settings
    USE_SETTINGS = True
except ImportError:
    print("⚠️  Could not import settings, using default values")
    USE_SETTINGS = False

def import_questions_from_csv(csv_path):
    """
    Reads questions from a CSV file and inserts them into a MongoDB collection.
    IMPROVED: Now uses configuration from settings and better error handling
    """
    
    # --- 1. CONNECT TO MONGODB ---
    if USE_SETTINGS:
        # Use settings from config
        mongo_url = settings.MONGO_URL
        database_name = settings.MONGO_DB
    else:
        # Fallback to defaults
        mongo_url = 'mongodb://localhost:27017/'
        database_name = 'dsa_with_ai'
    
    try:
        client = MongoClient(mongo_url)
        # Test connection
        client.admin.command('ping')
        print(f"✅ Connected to MongoDB at {mongo_url}")
    except Exception as e:
        print(f"❌ Failed to connect to MongoDB: {e}")
        return False
    
    # CORRECTED: Fixed database name - removed .csv extension
    DATABASE_NAME = database_name      # ✅ Fixed: Now uses proper database name
    COLLECTION_NAME = "questions"      # Collection name for questions
    
    db = client[DATABASE_NAME]
    collection = db[COLLECTION_NAME]
    
    print(f"📁 Using database '{DATABASE_NAME}' and collection '{COLLECTION_NAME}'")

    try:
        # --- 2. VALIDATE CSV FILE ---
        csv_file = Path(csv_path)
        if not csv_file.exists():
            print(f"❌ ERROR: The file '{csv_path}' was not found.")
            print(f"   Current working directory: {Path.cwd()}")
            print(f"   Looking for file at: {csv_file.absolute()}")
            return False
        
        print(f"📄 Found CSV file: {csv_file.absolute()}")
        print(f"   File size: {csv_file.stat().st_size / 1024:.1f} KB")

        # --- 3. READ AND VALIDATE CSV FILE ---
        try:
            df = pd.read_csv(csv_path)
            print(f"📊 CSV loaded successfully with {len(df)} rows and {len(df.columns)} columns")
            print(f"   Columns: {list(df.columns)}")
            
            # Show first few rows for verification
            if len(df) > 0:
                print(f"   First row sample: {df.iloc.to_dict()}")
                
        except Exception as e:
            print(f"❌ Error reading CSV file: {e}")
            return False
        
        # Convert the DataFrame to a list of dictionaries (which is what MongoDB needs)
        records = json.loads(df.to_json(orient='records'))
        
        if not records:
            print("⚠️ The CSV file is empty. No data to import.")
            return False

        # --- 4. IMPORT DATA TO MONGODB ---
        print(f"🔄 Preparing to import {len(records)} records...")
        
        # First, check if collection already has data
        existing_count = collection.count_documents({})
        if existing_count > 0:
            response = input(f"⚠️  Collection already contains {existing_count} documents. Delete existing data? (y/N): ")
            if response.lower() in ['y', 'yes']:
                result = collection.delete_many({})
                print(f"🧹 Deleted {result.deleted_count} existing documents")
            else:
                print("ℹ️  Keeping existing data. New data will be added.")
        
        # Insert the new records from the CSV
        try:
            result = collection.insert_many(records)
            inserted_count = len(result.inserted_ids)
            print(f"🎉 Successfully inserted {inserted_count} questions into the database!")
            
            # Verify insertion
            total_count = collection.count_documents({})
            print(f"📈 Total documents in collection: {total_count}")
            
            return True
            
        except Exception as e:
            print(f"❌ Error inserting data: {e}")
            return False
        
    except Exception as e:
        print(f"❌ An unexpected error occurred: {e}")
        return False
        
    finally:
        # --- 5. CLOSE THE CONNECTION ---
        try:
            client.close()
            print("🔗 Connection to MongoDB closed")
        except:
            pass

def main():
    """
    Main function to run the import script
    """
    import argparse
    
    parser = argparse.ArgumentParser(description='Import questions from CSV to MongoDB')
    parser.add_argument('csv_file', nargs='?', default='leetcode_dataset.csv', 
                       help='Path to the CSV file (default: leetcode_dataset.csv)')
    
    args = parser.parse_args()
    
    print("=" * 60)
    print("🚀 DSA WITH AI - CSV IMPORT UTILITY")
    print("=" * 60)
    
    success = import_questions_from_csv(args.csv_file)
    
    if success:
        print("\n✅ Import completed successfully!")
        print("💡 You can now start your FastAPI server and begin using the application.")
    else:
        print("\n❌ Import failed!")
        print("💡 Please check the error messages above and try again.")
        sys.exit(1)

# --- RUN THE SCRIPT ---
if __name__ == '__main__':
    main()
