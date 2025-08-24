from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .auth import router as auth_router
from .routes_practice import router as practice_router
from .routes_stats import router as stats_router
from .routes_chat import router as chat_router

app = FastAPI(title="DSAWithAI API")

origins = [o.strip() for o in settings.ALLOWED_ORIGINS.split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
    "http://localhost:5173",
    "http://localhost:3000",   
    "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(practice_router)
app.include_router(stats_router)
app.include_router(chat_router)

@app.get("/")
def root():
    return {"status":"ok","service":"DSAWithAI API"}
