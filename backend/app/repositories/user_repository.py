import uuid
from sqlalchemy.orm import Session
from app.models.user import User

class UserRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_email(self, email: str) -> User | None:
        return self.db.query(User).filter(User.email == email).first()

    def get_by_id(self, user_id: str | uuid.UUID) -> User | None:
        if isinstance(user_id, str):
            user_id = uuid.UUID(user_id)
        return self.db.query(User).filter(User.id == user_id).first()

    def create(self, first_name: str, last_name: str, birth_date, email: str, hashed_password: str) -> User:
        user = User(first_name=first_name, last_name=last_name, birth_date=birth_date, email=email, hashed_password=hashed_password)
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user