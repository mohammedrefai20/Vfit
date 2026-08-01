from app.core.di import SessionLocal
from app.models.exercise import Exercise

db = SessionLocal()
count = db.query(Exercise).count()
print(f"Total exercises: {count}")
sample = db.query(Exercise).first()
print(sample.name, "-", sample.primary_muscles)
db.close()