from fastapi import APIRouter
from .config import settings
import os, json

router = APIRouter(prefix="/chat", tags=["chat"])

@router.post("/ask")
async def ask(query: str):
    # Placeholder LLM integration; returns a canned hint if no API key configured.
    if not settings.OPENAI_API_KEY and not settings.GEMINI_API_KEY:
        return {"answer": "Hint: Break the problem down. Think about edge cases and start with a simple approach."}
    # Pseudocode (avoid hard dependency to run without keys)
    return {"answer": "LLM response would appear here (configure OPENAI_API_KEY or GEMINI_API_KEY)."}
