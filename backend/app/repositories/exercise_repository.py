from sqlalchemy.orm import Session
from app.models.exercise import Exercise

class ExerciseRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self) -> list[Exercise]:
        return self.db.query(Exercise).all()

    def get_by_id(self, exercise_id) -> Exercise | None:
        return self.db.query(Exercise).filter(Exercise.id == exercise_id).first()

    def filter_by_equipment(self, equipment: str) -> list[Exercise]:
        return self.db.query(Exercise).filter(Exercise.equipment.ilike(f"%{equipment}%")).all()