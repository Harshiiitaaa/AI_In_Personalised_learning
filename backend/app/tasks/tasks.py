import smtplib
from email.mime.text import MIMEText
from bson import ObjectId
from celery import Celery
from pymongo import MongoClient

# 1. Setup Celery
# This creates the Celery application instance that the worker will use.
celery = Celery(
    'tasks',
    broker='redis://localhost:6379/0',
    backend='redis://localhost:6379/0'
)

# 2. Setup Database Connection
# This uses pymongo, the synchronous driver, which is correct for this task.
client = MongoClient("mongodb://localhost:27017/")
db = client["dsa_with_ai"]


# 3. Your Email Function (simplified for testing)
# This function will print to the console to confirm the task works.
def send_email(to_email: str, subject: str, body: str):
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
    """
    # Fetch user + question to compose email
    user = db.users.find_one({"_id": ObjectId(user_id)})
    q = db.questions.find_one({"_id": ObjectId(question_id)})

    email = user.get("email") if user else None
    if email:
        link = q.get("url", "#") if q else "#"
        subject = "Let's revisit a question you attempted"
        body = f"Come back to practice: {q.get('name') if q else 'Question'}\nLink: {link}"
        send_email(email, subject, body)