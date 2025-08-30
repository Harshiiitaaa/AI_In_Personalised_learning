from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from bson import ObjectId
from pydantic import BaseModel
from typing import Optional

from .auth import get_current_user_id
from .db import db
from .tasks.tasks import reminder_failed_attempt
from .recommender import get_initial_questions, next_question
from .judge0 import run_code
from .models import SubmissionCreate 
from .config import settings

# --- Pydantic Models ---

class PracticeStartRequest(BaseModel):
    company: Optional[str] = None
    topic: Optional[str] = None
    difficulty: Optional[str] = None

# ✅ ADDED: A new model to define the structure of the submission JSON
class SubmissionCreate(BaseModel):
    question_name: str
    status: str
    started_at: float
    ended_at: float
    question_url: Optional[str] = None

class RunCodeRequest(BaseModel):
    language_id: int
    source_code: str
    stdin: Optional[str] = ""

router = APIRouter(prefix="/practice", tags=["practice"])

@router.post("/start")
async def start(data: PracticeStartRequest):
    qs = get_initial_questions(
        company=data.company, 
        topic=data.topic
    )
    if isinstance(qs, list):
        if len(qs) == 1:
            return {"problem": qs[0]}
        return {"problems": qs}
    return {"problems": []}

@router.post("/run")
async def run(payload: RunCodeRequest):
    if not payload.source_code.strip():
        raise HTTPException(status_code=400, detail="Source code is required")
    
    if payload.language_id not in [50, 54, 62, 63, 71]:
        raise HTTPException(status_code=400, detail="Unsupported language ID")
    
    try:
        res = await run_code(payload.source_code, payload.language_id, payload.stdin)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Code execution failed: {str(e)}")

# ✅ UPDATED: The /submit endpoint now uses the SubmissionCreate model
@router.post("/submit")
async def submit(payload: SubmissionCreate, user_id: str = Depends(get_current_user_id)):
    # Find the question using data from the payload object
    q = await db.questions.find_one({"name": payload.question_name})
    if not q and payload.question_url:
        q = await db.questions.find_one({"url": payload.question_url})
    
    if not q:
        raise HTTPException(status_code=404, detail="Question not found")
    
    # Calculate duration from payload timestamps
    duration_seconds = int(max(0, payload.ended_at - payload.started_at))
    
    attempt = {
        "user_id": ObjectId(user_id),
        "question_id": q["_id"],
        "status": payload.status,
        "started_at": datetime.fromtimestamp(payload.started_at),
        "ended_at": datetime.fromtimestamp(payload.ended_at),
        "duration_seconds": duration_seconds
    }
    await db.attempts.insert_one(attempt)
    
    # Update solved count if the status is "Accepted"
    if payload.status.lower() == "accepted":
        await db.users.update_one({"_id": ObjectId(user_id)}, {"$inc": {"solved_count": 1}})
        
   # --- ✅ NEW: Fetch AND Enrich user's last 10 attempts ---
    recent_attempts_cursor = db.attempts.find(
        {"user_id": ObjectId(user_id)}
    ).sort("ended_at", -1).limit(10)
    
    raw_attempts = await recent_attempts_cursor.to_list(length=10)
    
    enriched_attempts = []
    for att in raw_attempts:
        # For each attempt, find the corresponding question in the DB
        question_details = await db.questions.find_one({"_id": att["question_id"]})
        if question_details:
            # Add the details to the attempt dictionary
            att["difficulty"] = question_details.get("difficulty")
            enriched_attempts.append(att)
    # --- END OF NEW CODE ---

    duration_minutes = duration_seconds / 60.0
    # --- MODIFIED: Pass the new enriched data to the recommender ---
    nxt = next_question(
        prev_row=q,
        result=payload.status,
        duration_minutes=duration_minutes,
        recent_attempts=enriched_attempts, # 👈 Pass the enriched list
        solved_question_names=set() # You may want to fetch solved names here
    )
    
    # Schedule a reminder if the attempt was not successful
    if payload.status.lower() != "accepted":
        try:
            reminder_failed_attempt.apply_async(args=[user_id, str(q["_id"])], 
                                                countdown=settings.CELERY_REMINDER_DELAY_SECONDS)
        except Exception as e:
            print(f"Celery not configured or failed to schedule: {e}")
            
    message = "Great effort! Every attempt is a step forward." if payload.status.lower() != "accepted" else "Nice! Moving up."
    return {"next": nxt, "message": message}