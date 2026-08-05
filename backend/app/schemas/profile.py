from pydantic import BaseModel

class ProfileCreate(BaseModel):
    age: int
    sex: str
    height: float
    weight: float
    goal: str
    experience: str
    training_location: str
    equipment: str  # comma-separated, matches how the rule engine parses it
    training_days: int