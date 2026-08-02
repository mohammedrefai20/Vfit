from app.domain.rule_engine import apply_rules
from app.domain.entities import UserConstraints
from app.repositories.exercise_repository import ExerciseRepository

class RuleEngineService:
    def __init__(self, exercise_repo: ExerciseRepository):
        self.exercise_repo = exercise_repo

    def get_candidates(self, constraints: UserConstraints):
        all_exercises = self.exercise_repo.get_all()
        return apply_rules(all_exercises, constraints)