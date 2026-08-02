from dataclasses import dataclass

@dataclass
class UserConstraints:
    experience: str          # "Beginner" | "Intermediate" | "Advanced"
    equipment: list[str]     # e.g. ["Barbell", "Dumbbells", "Bodyweight"]
    training_location: str   # "Gym" | "Home"
    injuries: list[str]      # e.g. ["shoulder", "knee"] 

@dataclass
class RuleEngineResult:
    eligible_exercises: list   # list[Exercise]
    excluded_exercises: list   # list[tuple[Exercise, str]] - exercise + reason, for transparency

@dataclass
class VolumePrescription:
    exercise_count: int
    sets: int
    reps_range: tuple[int, int]