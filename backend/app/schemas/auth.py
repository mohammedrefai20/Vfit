from datetime import date
from pydantic import BaseModel, EmailStr
import uuid
class UserRegister(BaseModel):
    first_name: str
    last_name: str
    birth_date: date
    email: EmailStr
    password: str
    
class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: uuid.UUID
    email: EmailStr
    first_name: str
    last_name: str
    has_completed_onboarding: bool = False

    class Config:
        from_attributes = True
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"