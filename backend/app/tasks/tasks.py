import smtplib
from email.mime.text import MIMEText
from bson import ObjectId
from ..celery_app import celery
from pymongo import MongoClient
# CORRECTED: Added import for settings
from ..config import settings

# 1. Setup Celery - CORRECTED: Use settings instead of hardcoded values
# celery = Celery(
#     'tasks',
#     broker=settings.REDIS_URL,    # ✅ Fixed: use settings
#     backend=settings.REDIS_URL    # ✅ Fixed: use settings
# )

# 2. Setup Database Connection - CORRECTED: Use settings instead of hardcoded values
# client = MongoClient(settings.MONGO_URL)  # ✅ Fixed: use settings
# db = client[settings.MONGO_DB]            # ✅ Fixed: use settings

# 3. Your Email Function (simplified for testing)
# This function will print to the console to confirm the task works.
def send_email(to_email: str, subject: str, body: str):
    """
    IMPROVED: Added actual email sending capability with fallback to mock
    """
    if settings.SMTP_HOST and settings.SMTP_USER and settings.SMTP_PASSWORD:
        try:
            # Create SMTP connection
            with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                server.starttls()
                server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                
                # Create email message
                msg = MIMEText(body)
                msg['Subject'] = subject
                msg['From'] = settings.SMTP_FROM
                msg['To'] = to_email
                
                # Send email
                server.send_message(msg)
                print(f"✅ Email sent successfully to {to_email}")
                
        except Exception as e:
            print(f"❌ Email sending failed: {e}")
            # Fallback to mock
            _mock_email(to_email, subject, body)
    else:
        print("📧 SMTP not configured, using mock email")
        _mock_email(to_email, subject, body)

def _mock_email(to_email: str, subject: str, body: str):
    """Mock email function for development/testing"""
    print("--- EMAIL MOCK ---")
    print(f"To: {to_email}")
    print(f"Subject: {subject}")
    print(f"Body: {body}")
    print("--------------------")

# 4. Your Celery Task
# The @celery.task decorator registers this function as a task.
@celery.task
def reminder_failed_attempt(user_id: str, question_id: str):
    """
    Fetches user and question details from the database and sends a reminder email.
    IMPROVED: Added better error handling and logging
    """

    client = MongoClient(settings.MONGO_URL)
    db = client.get_database(settings.MONGO_DB)

    try:
        # Fetch user + question to compose email
        user = db.users.find_one({"_id": ObjectId(user_id)})
        q = db.questions.find_one({"_id": ObjectId(question_id)})

        if not user:
            print(f"❌ User not found: {user_id}")
            return {"status": "error", "message": "User not found"}
            
        if not q:
            print(f"❌ Question not found: {question_id}")
            return {"status": "error", "message": "Question not found"}

        email = user.get("email")
        if email:
            link = q.get("url", "#")
            subject = "Let's revisit a question you attempted"
            body = f"Hi {user.get('username', 'there')}!\n\nCome back to practice: {q.get('name', 'Question')}\nLink: {link}\n\nKeep practicing and you'll master it!"
            
            send_email(email, subject, body)
            return {"status": "success", "message": f"Reminder sent to {email}"}
        else:
            print(f"❌ No email found for user: {user_id}")
            return {"status": "error", "message": "No email found for user"}
            
    except Exception as e:
        print(f"❌ Task failed: {str(e)}")
        raise e
    finally:
        client.close()
