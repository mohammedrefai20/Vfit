from fastapi import APIRouter
from app.api.v1 import auth,health,workouts,chat,profile,progress,exercises

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(health.router, tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(workouts.router, prefix="/workouts", tags=["workouts"])
api_router.include_router(chat.router, prefix="/chat", tags=["chat"])
api_router.include_router(profile.router, prefix="/profile", tags=["profile"])
api_router.include_router(progress.router, prefix="/progress", tags=["progress"])
api_router.include_router(exercises.router, prefix="/exercises", tags=["exercises"])