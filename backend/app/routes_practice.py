from fastapi import APIRouter, Depends, HTTPException
from datetime import datetime
from bson import ObjectId
from pydantic import BaseModel

from .auth import get_current_user_id
from .db import db
# CORRECTED: 'load_dataset' is removed as it's no longer used or available
from .recommender import get_initial_questions, next_question
from .judge0 import run_code

class PracticeStartRequest(BaseModel):
    company: str | None = None
    topic: str | None = None
    difficulty: str | None = None

router = APIRouter(prefix="/practice", tags=["practice"])

@router.post("/start")
async def start(data: PracticeStartRequest):
    # REMOVED: The database seeding logic has been removed from this API endpoint.
    # This should be done in a separate, one-time setup script, not on every API call.
    
    qs = get_initial_questions(
        company=data.company, 
        topic=data.topic,
        difficulty = data.difficulty
    )

    # Return "problem" or "problems" as frontend expects:
    if isinstance(qs, list):
        if len(qs) == 1:
            return {"problem" : qs[0]}
        return {"problems" : qs}
    return {"problems" : []}    # fallback if qs is empty/None


@router.post("/run")
async def run(language_id: int, source_code: str, stdin: str = ""):
    # In app/routes_practice.py in the 'run' function
    res = await run_code(source_code, language_id, stdin)
    return res


@router.post("/submit")
async def submit(question_name: str, question_url: str = "", status: str = "Accepted",
                 started_at: float = 0, ended_at: float = 0, user_id: str | None = Depends(get_current_user_id)):
    # Map question
    q = await db.questions.find_one({"name": question_name, "url": question_url})
    if not q:
        raise HTTPException(404, "Question not found")
    
    duration_seconds = int(max(0, ended_at - started_at))
    attempt = {
        "user_id": ObjectId(user_id),
        "question_id": q["_id"],
        "status": status,
        "started_at": datetime.fromtimestamp(started_at) if started_at else datetime.utcnow(),
        "ended_at": datetime.fromtimestamp(ended_at) if ended_at else datetime.utcnow(),
        "duration_seconds": duration_seconds
    }
    await db.attempts.insert_one(attempt)
    
    # Update solved_count on Accepted
    if status.lower() == "accepted":
        await db.users.update_one({"_id": ObjectId(user_id)}, {"$inc": {"solved_count": 1}})
        
    # Next question logic
    duration_minutes = duration_seconds / 60.0
    
    # UPDATED: The new recommender needs the full question object (especially the 'name')
    # to find its nearest neighbors in the model.
    nxt = next_question(prev_row=q, result=status, duration_minutes=duration_minutes)
    
    # Schedule reminder if not accepted
    if status.lower() != "accepted":
        try:
            from .tasks.tasks import reminder_failed_attempt
            eta_seconds = 3 * 24 * 3600
            reminder_failed_attempt.apply_async(args=[user_id, str(q["_id"])], countdown=eta_seconds)
        except Exception as e:
            print("Celery not configured or failed to schedule:", e)
            
    message = "Great effort! Every attempt is a step forward." if status.lower() != "accepted" else "Nice! Moving up."
    return {"next": nxt, "message": message}