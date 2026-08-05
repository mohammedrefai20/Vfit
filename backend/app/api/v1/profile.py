
from fastapi import APIRouter, Depends, HTTPException
from app.schemas.profile import ProfileCreate
from app.repositories.profile_repository import ProfileRepository
from app.core.di import get_profile_repository
from app.core.di import get_current_user
from app.models.user import User




router = APIRouter()

@router.post("/profile")
def create_profile(
    payload: ProfileCreate,
    current_user: User = Depends(get_current_user),
    profile_repo: ProfileRepository = Depends(get_profile_repository),
):
    existing = profile_repo.get_by_user_id(current_user.id)
    if existing:
        raise HTTPException(status_code=400, detail="Profile already exists")
    profile = profile_repo.create(current_user.id, **payload.model_dump())
    return {"status": "created"}