from app.repositories.user_repository import UserRepository
from app.core.security import hash_password, verify_password, create_access_token

class AuthService:
    def __init__(self, user_repository: UserRepository):
        self.user_repository = user_repository

    def register(self, first_name: str, last_name: str, birth_date, email: str, password: str):
        existing = self.user_repository.get_by_email(email)
        if existing:
            raise ValueError("Email already registered")
        hashed = hash_password(password)
        user = self.user_repository.create(first_name, last_name, birth_date, email, hashed)
        return user

    def login(self, email: str, password: str) -> str:
        user = self.user_repository.get_by_email(email)
        if not user or not verify_password(password, user.hashed_password):
            raise ValueError("Invalid credentials")
        return create_access_token(str(user.id))
    def change_password(self, user, current_password: str, new_password: str):
        if not verify_password(current_password, user.hashed_password):
            raise ValueError("Current password is incorrect")
        user.hashed_password = hash_password(new_password)
        self.user_repository.db.commit()