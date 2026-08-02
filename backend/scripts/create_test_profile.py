from app.core.di import SessionLocal
from app.models.profile import Profile
from app.models.user import User

db = SessionLocal()

# Replace with your actual registered user's email
test_user = db.query(User).filter(User.email == "user_0@example.com").first()

if test_user is None:
    print("User not found — register first via /auth/register")
else:
    existing = db.query(Profile).filter(Profile.user_id == test_user.id).first()
    if existing:
        print("Profile already exists for this user.")
    else:
        profile = Profile(
            user_id=test_user.id,
            age=25,
            sex="Male",
            height=178.0,
            weight=75.0,
            goal="Hypertrophy",
            experience="Beginner",
            training_location="Home",
            equipment="Bodyweight,Dumbbells",
            training_days=3,
        )
        db.add(profile)
        db.commit()
        print(f"Test profile created for {test_user.email}")

db.close()