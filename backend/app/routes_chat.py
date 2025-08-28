from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from .chatbot import get_gemini_response

router = APIRouter(prefix="/chat", tags=["chat"])

class ChatRequest(BaseModel):
    message: str
    question_context: str = "" # The name or description of the current problem

@router.post("/ask")
async def ask(payload: ChatRequest):
    if not payload.message:
        raise HTTPException(status_code=400, detail="Message cannot be empty.")
    
    try:
        # Get the response from our new chatbot logic
        answer = await get_gemini_response(payload.message, payload.question_context)
        return {"answer": answer}
    except Exception as e:
        print(f"Chat endpoint error: {e}")
        raise HTTPException(status_code=500, detail="Failed to get a response from the chatbot.")

