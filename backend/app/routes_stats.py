from fastapi import APIRouter, Depends
from bson import ObjectId
from .auth import get_current_user_id
from .db import db

router = APIRouter(prefix="/stats", tags=["stats"])

@router.get("/profile")
async def profile(user_id: str = Depends(get_current_user_id)):
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    attempts = db.attempts.find({"user_id": ObjectId(user_id)})
    total = 0
    accepted = 0
    per_question = {}
    async for a in attempts:
        total += 1
        if a.get("status","").lower() == "accepted":
            accepted += 1
        qid = str(a["question_id"])
        per_question[qid] = per_question.get(qid, 0) + 1
    return {
        "username": user.get("username",""),
        "email": user.get("email",""),
        "solved_count": user.get("solved_count",0),
        "attempts_total": total,
        "accepted_total": accepted,
        "per_question_attempts": per_question
    }
