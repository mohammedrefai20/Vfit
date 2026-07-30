from functools import lru_cache
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings
from app.repositories.user_repository import UserRepository
from app.services.auth_service import AuthService
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from app.core.security import decode_access_token
from app.models.user import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

@lru_cache
def get_settings():
    return settings

engine = create_engine(settings.database_url)
SessionLocal = sessionmaker(bind=engine)

def get_db_session() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
def get_user_repository(db: Session = Depends(get_db_session)) -> UserRepository:
    return UserRepository(db)

def get_auth_service(repo: UserRepository = Depends(get_user_repository)) -> AuthService:
    return AuthService(repo)
# Provider/repository factories will be added here in later phases,
# e.g. get_llm_provider(), get_db_session(), get_exercise_repository()



def get_current_user(
    token: str = Depends(oauth2_scheme),
    repo: UserRepository = Depends(get_user_repository),
) -> User:
    user_id = decode_access_token(token)
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = repo.get_by_id(user_id)  # add this method to UserRepository, mirrors get_by_email
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user