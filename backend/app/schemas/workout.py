from pydantic import BaseModel

class ReplaceExerciseRequest(BaseModel):
    new_exercise_id: str