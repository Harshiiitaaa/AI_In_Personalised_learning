from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List, Literal
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserPublic(BaseModel):
    id: str
    username: str
    email: EmailStr
    solved_count: int = 0

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"

class Question(BaseModel):
    id: str
    name: str
    difficulty: Literal["Easy","Medium","Hard"]
    company: Optional[str] = None
    topic: Optional[str] = None
    description: Optional[str] = None
    url: Optional[str] = None

class Attempt(BaseModel):
    user_id: str
    question_id: str
    status: str  # Accepted, Wrong Answer, TLE, etc.
    language: Optional[str] = None
    code: Optional[str] = None
    started_at: datetime
    ended_at: datetime
    duration_seconds: int
