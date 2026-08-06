import uuid

from sqlalchemy.orm import Session
from app.models.exercise import Exercise

class ExerciseRepository:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self) -> list[Exercise]:
        return self.db.query(Exercise).all()

    def get_by_id(self, exercise_id) -> Exercise | None:
        if isinstance(exercise_id, str):
            exercise_id = uuid.UUID(exercise_id)
        return self.db.query(Exercise).filter(Exercise.id == exercise_id).first()

    def get_alternatives(self, exercise_id) -> list[Exercise]:
        from app.models.exercise_alternative import ExerciseAlternative
        if isinstance(exercise_id, str):
            exercise_id = uuid.UUID(exercise_id)
        rows = (
            self.db.query(Exercise)
            .join(ExerciseAlternative, ExerciseAlternative.alternative_exercise_id == Exercise.id)
            .filter(ExerciseAlternative.exercise_id == exercise_id)
            .all()
        )
        return rows

    def filter_by_equipment(self, equipment: str) -> list[Exercise]:
        return self.db.query(Exercise).filter(Exercise.equipment.ilike(f"%{equipment}%")).all()