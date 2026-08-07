from fastapi import APIRouter, Depends, HTTPException
from app.core.di import get_auth_service,get_db_session
from app.services.auth_service import AuthService
from app.schemas.auth import UserRegister, UserLogin, UserResponse, Token, PasswordChange
from app.core.di import get_current_user
from app.models.user import User
from app.repositories.profile_repository import ProfileRepository
from app.core.di import get_profile_repository
from app.schemas.profile import ProfileCreate

router = APIRouter()

@router.post("/register", response_model=UserResponse)
def register(payload: UserRegister, auth_service: AuthService = Depends(get_auth_service)):
    try:
        user = auth_service.register(
            payload.first_name, payload.last_name, payload.birth_date, payload.email, payload.password
        )
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
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
@router.put("/me")
def update_name(payload: dict, current_user: User = Depends(get_current_user), db=Depends(get_db_session)):
    current_user.first_name = payload.get("first_name", current_user.first_name)
    current_user.last_name = payload.get("last_name", current_user.last_name)
    db.commit()
    return {"status": "updated"}

@router.post("/change-password")
def change_password(
    payload: PasswordChange,
    current_user: User = Depends(get_current_user),
    auth_service: AuthService = Depends(get_auth_service),
):
    try:
        auth_service.change_password(current_user, payload.current_password, payload.new_password)
        return {"status": "updated"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))