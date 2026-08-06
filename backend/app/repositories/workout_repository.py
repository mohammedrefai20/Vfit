import uuid
from app.models.workout import Workout
from app.models.workout_exercise import WorkoutExercise
from app.models.exercise import Exercise

class WorkoutRepository:
    """Handles saving workout plans and enforcing the latest-3-versions retention rule."""

    def __init__(self, db):
        self.db = db

    def save_new_version(self, user_id, plan_data: dict, volume, plan_name: str) -> Workout:

        existing = (
            self.db.query(Workout)
            .filter(Workout.user_id == user_id)
            .order_by(Workout.version_number.desc())
            .all()
        )
        next_version = (existing[0].version_number + 1) if existing else 1

        workout = Workout(user_id=user_id, version_number=next_version, is_active=True, name=plan_name)
        self.db.add(workout)
        self.db.flush()

        for day in plan_data["days"]:
            for order, exercise in enumerate(day["exercises"]):
                self.db.add(WorkoutExercise(
                    workout_id=workout.id,
                    exercise_id=uuid.UUID(exercise["exercise_id"]),  # convert string -> real UUID
                    day_number=day["day_number"],
                    sets=volume.sets,
                    reps=volume.reps_range[1],
                    order=order,
                ))

        # Enforce "latest 3 versions" - delete oldest if now exceeding 3
        if len(existing) >= 3:
            oldest = existing[-1]
            self.db.delete(oldest)

        self.db.commit()
        self.db.refresh(workout)
        return workout
    def get_by_id_with_exercises(self, workout_id, user_id):
        """Fetch a workout with its exercises, scoped to the owning user."""
        workout = self.db.query(Workout).filter(Workout.id == workout_id, Workout.user_id == user_id).first()
        if workout is None:
            return None
        exercises = (
            self.db.query(WorkoutExercise, Exercise)
            .join(Exercise, WorkoutExercise.exercise_id == Exercise.id)
            .filter(WorkoutExercise.workout_id == workout_id)
            .order_by(WorkoutExercise.day_number, WorkoutExercise.order)
            .all()
        )
        return workout, exercises
    def get_latest_for_user(self, user_id):
        """Return the user's most recent workout (by version_number), or None if none exist."""
        return (
            self.db.query(Workout)
            .filter(Workout.user_id == user_id)
            .order_by(Workout.version_number.desc())
            .first()
        )
    def get_workout_exercise(self, workout_exercise_id, user_id):
        """Fetch a single workout_exercise row, scoped through its parent workout's owner."""
        if isinstance(workout_exercise_id, str):
            workout_exercise_id = uuid.UUID(workout_exercise_id)
        return (
            self.db.query(WorkoutExercise)
            .join(Workout, Workout.id == WorkoutExercise.workout_id)
            .filter(WorkoutExercise.id == workout_exercise_id, Workout.user_id == user_id)
            .first()
        )

    def replace_exercise(self, workout_exercise_id, new_exercise_id):
        workout_exercise = self.db.query(WorkoutExercise).filter(WorkoutExercise.id == workout_exercise_id).first()
        workout_exercise.exercise_id = new_exercise_id
        self.db.commit()
        self.db.refresh(workout_exercise)
        return workout_exercise

    
    def get_all_for_user(self, user_id):
        """Return all of a user's workout versions (up to 3, per the retention rule), newest first."""
        return (
            self.db.query(Workout)
            .filter(Workout.user_id == user_id)
            .order_by(Workout.version_number.desc())
            .all()
        )