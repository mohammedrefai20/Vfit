from fastapi import APIRouter, Depends, HTTPException
from app.core.di import get_auth_service
from app.services.auth_service import AuthService
from app.schemas.auth import UserRegister, UserLogin, UserResponse, Token
from app.core.di import get_current_user
from app.models.user import User
from app.repositories.profile_repository import ProfileRepository
from app.core.di import get_profile_repository

router = APIRouter()

@router.post("/register", response_model=UserResponse)
def register(payload: UserRegister, auth_service: AuthService = Depends(get_auth_service)):
    try:
        user = auth_service.register(payload.email, payload.password)
        return user
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/login", response_model=Token)
def login(payload: UserLogin, auth_service: AuthService = Depends(get_auth_service)):
    try:
        token = auth_service.login(payload.email, payload.password)
        return Token(access_token=token)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))

@router.get("/me", response_model=UserResponse)
def get_me(
    current_user: User = Depends(get_current_user),
    profile_repo: ProfileRepository = Depends(get_profile_repository),
):
    profile = profile_repo.get_by_user_id(current_user.id)
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        has_completed_onboarding=profile is not None,
    )