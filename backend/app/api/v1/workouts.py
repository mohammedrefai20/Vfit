from fastapi import APIRouter, Depends, HTTPException
from app.core.di import get_current_user, get_workout_planner_service, get_profile_repository,get_workout_repository, get_exercise_repository
from app.models.user import User
from app.repositories.workout_repository import WorkoutRepository
from app.repositories.exercise_repository import ExerciseRepository
from app.models.exercise import Exercise
router = APIRouter()

from pydantic import BaseModel

class GenerateWorkoutRequest(BaseModel):
    name: str = "My Workout Plan"

@router.post("/generate")
def generate_workout(
    payload: GenerateWorkoutRequest,
    current_user: User = Depends(get_current_user),
    planner_service = Depends(get_workout_planner_service),
    profile_repo = Depends(get_profile_repository),
):
    profile = profile_repo.get_by_user_id(current_user.id)
    if profile is None:
        raise HTTPException(status_code=400, detail="Complete onboarding before generating a plan")
    try:
        workout = planner_service.generate_plan(current_user.id, profile, payload.name)
        return {"workout_id": str(workout.id), "version": workout.version_number, "name": workout.name}
    except ValueError as e:
        raise HTTPException(status_code=502, detail=f"Plan generation failed validation: {e}")


@router.get("/{workout_id}")
def get_workout(
    workout_id: str,
    current_user: User = Depends(get_current_user),
    workout_repo: WorkoutRepository = Depends(get_workout_repository),
    exercise_repo: ExerciseRepository = Depends(get_exercise_repository),
):
    result = workout_repo.get_by_id_with_exercises(workout_id, current_user.id)
    if result is None:
        raise HTTPException(status_code=404, detail="Workout not found")

    workout, exercise_rows = result
    days: dict[int, list] = {}
    for workout_exercise, exercise in exercise_rows:
        alternatives = exercise_repo.get_alternatives(exercise.id)
        days.setdefault(workout_exercise.day_number, []).append({
            "workout_exercise_id": str(workout_exercise.id),
            "name": exercise.name,
            "sets": workout_exercise.sets,
            "reps": workout_exercise.reps,
            "primary_muscles": exercise.primary_muscles,
            "alternatives": [{"id": str(a.id), "name": a.name} for a in alternatives],
        })

    return {
        "workout_id": str(workout.id),
        "version": workout.version_number,
        "days": [{"day_number": d, "exercises": ex} for d, ex in sorted(days.items())],
    }
@router.get("")
def get_latest_workout(
    current_user: User = Depends(get_current_user),
    workout_repo: WorkoutRepository = Depends(get_workout_repository),
    name: str = None,  # optional query param to filter by name
):
    latest = workout_repo.get_latest_for_user(current_user.id)
    if latest is None:
        return None
    return {"workout_id": str(latest.id), "version": latest.version_number, "name": latest.name}
from app.schemas.workout import ReplaceExerciseRequest  # define below

@router.post("/{workout_id}/exercises/{workout_exercise_id}/replace")
def replace_exercise(
    workout_id: str,
    workout_exercise_id: str,
    payload: ReplaceExerciseRequest,
    current_user: User = Depends(get_current_user),
    workout_repo: WorkoutRepository = Depends(get_workout_repository),
    exercise_repo: ExerciseRepository = Depends(get_exercise_repository),
):
    workout_exercise = workout_repo.get_workout_exercise(workout_exercise_id, current_user.id)
    if workout_exercise is None:
        raise HTTPException(status_code=404, detail="Exercise not found in your workout")

    original_exercise = exercise_repo.get_by_id(workout_exercise.exercise_id)
    valid_alternatives = exercise_repo.get_alternatives(workout_exercise.exercise_id)
    valid_ids = {str(a.id) for a in valid_alternatives}

    if payload.new_exercise_id not in valid_ids:
        raise HTTPException(status_code=400, detail="That exercise isn't an approved alternative for this slot")

    new_exercise = exercise_repo.get_by_id(payload.new_exercise_id)
    workout_repo.replace_exercise(workout_exercise_id, new_exercise.id)

    from app.domain.replacement_explainer import explain_replacement
    explanation = explain_replacement(original_exercise.name, new_exercise.name, new_exercise.primary_muscles)

    return {"new_exercise_name": new_exercise.name, "explanation": explanation}

@router.get("/versions/all")
def get_all_versions(
    current_user: User = Depends(get_current_user),
    workout_repo: WorkoutRepository = Depends(get_workout_repository),
    exercise_repo: ExerciseRepository = Depends(get_exercise_repository),
    name: str = None,  # optional query param to filter by name
):
    workouts = workout_repo.get_all_for_user(current_user.id)
    result = []
    for workout in workouts:
        full = workout_repo.get_by_id_with_exercises(workout.id, current_user.id)
        _, exercise_rows = full
        total_exercises = len(exercise_rows)
        days_used = len({we.day_number for we, _ in exercise_rows})
        result.append({
            "workout_id": str(workout.id),
            "version": workout.version_number,
            "created_at": workout.created_at,
            "total_exercises": total_exercises,
            "days": days_used,
            "name": workout.name,
        })
    return result