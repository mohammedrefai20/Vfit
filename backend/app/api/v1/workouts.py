from fastapi import APIRouter, Depends, HTTPException
from app.core.di import get_current_user, get_workout_planner_service, get_profile_repository,get_workout_repository
from app.models.user import User
from app.repositories.workout_repository import WorkoutRepository
from app.models.exercise import Exercise
router = APIRouter()

@router.post("/generate")
def generate_workout(
    current_user: User = Depends(get_current_user),
    planner_service = Depends(get_workout_planner_service),
    profile_repo = Depends(get_profile_repository),
):
    profile = profile_repo.get_by_user_id(current_user.id)
    if profile is None:
        raise HTTPException(status_code=400, detail="Complete onboarding before generating a plan")

    try:
        workout = planner_service.generate_plan(current_user.id, profile)
        return {"workout_id": str(workout.id), "version": workout.version_number}
    except ValueError as e:
        raise HTTPException(status_code=502, detail=f"Plan generation failed validation: {e}")


@router.get("/{workout_id}")
def get_workout(
    workout_id: str,
    current_user: User = Depends(get_current_user),
    workout_repo: WorkoutRepository = Depends(get_workout_repository),
):
    result = workout_repo.get_by_id_with_exercises(workout_id, current_user.id)
    if result is None:
        raise HTTPException(status_code=404, detail="Workout not found")

    workout, exercise_rows = result
    days: dict[int, list] = {}
    for workout_exercise, exercise in exercise_rows:
        days.setdefault(workout_exercise.day_number, []).append({
            "name": exercise.name,
            "sets": workout_exercise.sets,
            "reps": workout_exercise.reps,
            "primary_muscles": exercise.primary_muscles,
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
):
    latest = workout_repo.get_latest_for_user(current_user.id)
    if latest is None:
        return None
    return {"workout_id": str(latest.id), "version": latest.version_number}