from fastapi import APIRouter, Depends, HTTPException
from app.core.di import get_exercise_repository
from app.repositories.exercise_repository import ExerciseRepository
from app.schemas.exercise import ExerciseSummary, ExerciseDetail

router = APIRouter()

@router.get("", response_model=list[ExerciseSummary])
def list_exercises(repo: ExerciseRepository = Depends(get_exercise_repository)):
    exercises = repo.get_all()
    return [
        ExerciseSummary(id=str(e.id), name=e.name, primary_muscles=e.primary_muscles, equipment=e.equipment, difficulty=e.difficulty)
        for e in exercises
    ]

@router.get("/{exercise_id}", response_model=ExerciseDetail)
def get_exercise(exercise_id: str, repo: ExerciseRepository = Depends(get_exercise_repository)):
    exercise = repo.get_by_id(exercise_id)
    if exercise is None:
        raise HTTPException(status_code=404, detail="Exercise not found")
    alternatives = repo.get_alternatives(exercise_id)
    return ExerciseDetail(
        id=str(exercise.id), name=exercise.name, primary_muscles=exercise.primary_muscles,
        secondary_muscles=exercise.secondary_muscles, equipment=exercise.equipment,
        difficulty=exercise.difficulty, movement_type=exercise.movement_type,
        instructions=exercise.instructions, contraindications=exercise.contraindications,
        youtube_url=exercise.youtube_url,
        alternatives=[ExerciseSummary(id=str(a.id), name=a.name, primary_muscles=a.primary_muscles, equipment=a.equipment, difficulty=a.difficulty) for a in alternatives],
    )