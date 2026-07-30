from pydantic import BaseModel, EmailStr
import uuid

class UserRegister(BaseModel):
    email: EmailStr
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: uuid.UUID
    email: EmailStr

    class Config:
        from_attributes = True  # allows building this from a SQLAlchemy model instance

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"