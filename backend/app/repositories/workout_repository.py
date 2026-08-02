from app.models.workout import Workout
from app.models.workout_exercise import WorkoutExercise

class WorkoutRepository:
    """Handles saving workout plans and enforcing the latest-3-versions retention rule."""

    def __init__(self, db):
        self.db = db

    def save_new_version(self, user_id, plan_data: dict, volume) -> Workout:
        existing = (
            self.db.query(Workout)
            .filter(Workout.user_id == user_id)
            .order_by(Workout.version_number.desc())
            .all()
        )
        next_version = (existing[0].version_number + 1) if existing else 1

        workout = Workout(user_id=user_id, version_number=next_version, is_active=True)
        self.db.add(workout)
        self.db.flush()

        for day in plan_data["days"]:
            for order, exercise in enumerate(day["exercises"]):
                self.db.add(WorkoutExercise(
                    workout_id=workout.id,
                    exercise_id=exercise["exercise_id"],
                    day_number=day["day_number"],
                    sets=volume.sets,
                    reps=volume.reps_range[1],  # store upper bound of range for simplicity
                    order=order,
                ))

        # Enforce "latest 3 versions" - delete oldest if now exceeding 3
        if len(existing) >= 3:
            oldest = existing[-1]
            self.db.delete(oldest)

        self.db.commit()
        self.db.refresh(workout)
        return workout