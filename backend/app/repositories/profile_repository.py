import uuid
from sqlalchemy.orm import Session
from app.models.profile import Profile

class ProfileRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_by_user_id(self, user_id):
        if isinstance(user_id, str):
            user_id = uuid.UUID(user_id)
        return self.db.query(Profile).filter(Profile.user_id == user_id).first()

    def create(self, user_id, **fields):
        profile = Profile(user_id=user_id, **fields)
        self.db.add(profile)
        self.db.commit()
        self.db.refresh(profile)
        return profile
    def update(self, user_id, **fields):
        profile = self.get_by_user_id(user_id)
        for key, value in fields.items():
            setattr(profile, key, value)
        self.db.commit()
        self.db.refresh(profile)
        return profile