from fastapi import APIRouter, Depends, HTTPException
from app.core.di import get_current_user, get_workout_planner_service, get_profile_repository
from app.models.user import User

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