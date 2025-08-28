from fastapi import APIRouter, Depends
from bson import ObjectId
from datetime import datetime, timedelta
from .auth import get_current_user_id
from .db import db

router = APIRouter(prefix="/stats", tags=["stats"])

def calculate_streak(attempts):
    if not attempts:
        return 0

    # Sort attempts by date, newest first
    attempts.sort(key=lambda x: x['ended_at'], reverse=True)
    
    streak = 0
    today = datetime.utcnow().date()
    yesterday = today - timedelta(days=1)
    
    # Get unique days the user solved problems
    unique_days = sorted(list(set(a['ended_at'].date() for a in attempts if a.get("status", "").lower() == "accepted")), reverse=True)
    
    if not unique_days:
        return 0

    # Check if the most recent solve was today or yesterday
    if unique_days[0] not in [today, yesterday]:
        return 0

    # If the most recent solve was yesterday, today counts
    if unique_days[0] == yesterday:
        streak = 1
    
    # If the most recent solve was today, it counts
    if unique_days[0] == today:
        streak = 1


    # Loop through the rest of the days to count the streak
    for i in range(len(unique_days) - 1):
        if (unique_days[i] - unique_days[i+1]).days == 1:
            streak += 1
        else:
            break
            
    return streak

@router.get("/profile")
async def profile(user_id: str = Depends(get_current_user_id)):
    user_oid = ObjectId(user_id)
    
    # Fetch user and all their attempts in parallel
    user_task = db.users.find_one({"_id": user_oid})
    attempts_task = db.attempts.find({"user_id": user_oid}).to_list(length=1000) # Fetch all attempts

    user, all_attempts = await user_task, await attempts_task

    if not user:
        return {"error": "User not found"}

    total = len(all_attempts)
    accepted = sum(1 for a in all_attempts if a.get("status", "").lower() == "accepted")
    
    # --- NEW LOGIC ---
    # Calculate streak
    current_streak = calculate_streak(all_attempts)
    
    # Get recent problems (last 5)
    all_attempts.sort(key=lambda x: x['ended_at'], reverse=True)
    recent_attempts_docs = []
    
    # Create a list of unique recent question IDs to avoid duplicates in the list
    recent_question_ids = []
    for attempt in all_attempts:
        if len(recent_question_ids) >= 5:
            break
        if attempt['question_id'] not in recent_question_ids:
            recent_question_ids.append(attempt['question_id'])

    if recent_question_ids:
        questions = await db.questions.find({"_id": {"$in": recent_question_ids}}).to_list(length=5)
        # Create a map for easy lookup
        question_map = {q['_id']: q for q in questions}
        
        for q_id in recent_question_ids:
            if q_id in question_map:
                q_doc = question_map[q_id]
                # Find the last status for this problem
                last_status = next((a['status'] for a in all_attempts if a['question_id'] == q_id), "attempted")
                recent_attempts_docs.append({
                    "name": q_doc.get("name"),
                    "difficulty": q_doc.get("difficulty"),
                    "status": last_status.lower()
                })

    return {
        "username": user.get("username", ""),
        "email": user.get("email", ""),
        "solved_count": user.get("solved_count", 0),
        "attempts_total": total,
        "accepted_total": accepted,
        "success_rate": round((accepted / total) * 100) if total > 0 else 0,
        "current_streak": current_streak,
        "recent_problems": recent_attempts_docs
    }