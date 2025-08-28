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
        
    # Get the next recommended question
    duration_minutes = duration_seconds / 60.0
    nxt = next_question(prev_row=q, result=payload.status, duration_minutes=duration_minutes)
    
    # Schedule a reminder if the attempt was not successful
    if payload.status.lower() != "accepted":
        try:
            eta_seconds = 3 * 24 * 3600  # 3 days
            reminder_failed_attempt.apply_async(args=[user_id, str(q["_id"])], countdown=eta_seconds)
        except Exception as e:
            print(f"Celery not configured or failed to schedule: {e}")
            
    message = "Great effort! Every attempt is a step forward." if payload.status.lower() != "accepted" else "Nice! Moving up."
    return {"next": nxt, "message": message}