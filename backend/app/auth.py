from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import EmailStr
from .db import db
from .models import UserCreate, UserLogin, UserPublic, Token
from .security import hash_password, verify_password, create_access_token, decode_token
from bson import ObjectId
import datetime
import logging

logger = logging.getLogger("app")

router = APIRouter(prefix="/auth", tags=["auth"])

security = HTTPBearer()

def get_current_user_id(credential: HTTPAuthorizationCredentials = Depends(security)) -> str:
    token = credential.credentials
    sub = decode_token(token)
    if not sub:
        raise HTTPException(status_code=401, detail="Invalid token")
    return sub

@router.post("/signup", response_model=UserPublic)
async def signup(payload: UserCreate):
    existing = await db.users.find_one({"email": payload.email})
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = {
        "username": payload.username,
        "email": payload.email,
        "password": hash_password(payload.password),
        "solved_count": 0,
        "created_at": datetime.datetime.utcnow(),
    }
    res = await db.users.insert_one(user)
    return UserPublic(id=str(res.inserted_id), username=user["username"], email=user["email"], solved_count=0)

@router.post("/login", response_model=Token)
async def login(payload: UserLogin):

    user = await db.users.find_one({"email": payload.email})
    if not user or not verify_password(payload.password, user["password"]):
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    token = create_access_token(str(user["_id"]))
    logger.info(f"User {user['username']} logged in successfully")
    return Token(access_token=token)

@router.get("/me", response_model=UserPublic)
async def me(user_id: str = Depends(get_current_user_id)):
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return UserPublic(id=str(user["_id"]), username=user["username"], email=user["email"], solved_count=user.get("solved_count", 0))
