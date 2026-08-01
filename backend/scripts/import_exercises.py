import json
from app.core.di import SessionLocal
from app.models.exercise import Exercise
from app.models.exercise_alternative import ExerciseAlternative

def import_exercises(filepath: str):
    with open(filepath) as f:
        data = json.load(f)

    db = SessionLocal()
    name_to_id = {}

    # First pass: create all exercises so every name has an id to reference
    for entry in data:
        exercise = Exercise(
            name=entry["name"],
            primary_muscles=entry["primary_muscles"],
            secondary_muscles=entry["secondary_muscles"],
            equipment=entry["equipment"],
            difficulty=entry["difficulty"],
            movement_type=entry["movement_type"],
            instructions=entry["instructions"],
            contraindications=entry.get("contraindications"),
            youtube_url=entry["youtube_url"],
        )
        db.add(exercise)
        db.flush()  # assigns exercise.id without committing yet
        name_to_id[entry["name"]] = exercise.id

    # Second pass: link alternatives, now that every exercise has an id
    for entry in data:
        for alt_name in entry.get("alternatives", []):
            if alt_name in name_to_id:
                db.add(ExerciseAlternative(
                    exercise_id=name_to_id[entry["name"]],
                    alternative_exercise_id=name_to_id[alt_name],
                ))

    db.commit()
    print(f"Imported {len(data)} exercises.")

if __name__ == "__main__":
    import_exercises("data/exercises_draft.json")