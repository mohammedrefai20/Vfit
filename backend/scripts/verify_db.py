from app.core.di import SessionLocal
from app.models.user import User

db = SessionLocal()
db.add(User(email="test@example.com", hashed_password="placeholder"))
db.commit()
print(db.query(User).all())
db.close()