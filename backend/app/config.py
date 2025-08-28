from pydantic_settings import BaseSettings
from pydantic import AnyUrl
from typing import List, Optional

class Settings(BaseSettings):
    SECRET_KEY: str = "change_me_super_secret"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60*24

    MONGO_URL: str = "mongodb://localhost:27017"
    MONGO_DB: str = "dsa_with_ai"

    JUDGE0_URL: str = ""
    JUDGE0_KEY: str = ""
    JUDGE0_HOST_HEADER: str = ""

    OPENAI_API_KEY: str = ""
    GEMINI_API_KEY: str = ""

    ALLOWED_ORIGINS: str = "http://localhost:5173"

    REDIS_URL: str = "redis://localhost:6379/0"

    SMTP_HOST: str = ""
    SMTP_PORT: int = 587
    SMTP_USER: str = ""
    SMTP_PASSWORD: str = ""
    SMTP_FROM: str = "no-reply@dsawithai.local"

    VITE_API_URL: Optional[str] = None 
    
    class Config:
        env_file = ".env"

settings = Settings()
