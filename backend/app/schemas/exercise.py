from pydantic import BaseModel

class ExerciseSummary(BaseModel):
    id: str
    name: str
    primary_muscles: str
    equipment: str
    difficulty: str

class ExerciseDetail(BaseModel):
    id: str
    name: str
    primary_muscles: str
    secondary_muscles: str
    equipment: str
    difficulty: str
    movement_type: str
    instructions: str
    contraindications: str | None
    youtube_url: str
    alternatives: list[ExerciseSummary]