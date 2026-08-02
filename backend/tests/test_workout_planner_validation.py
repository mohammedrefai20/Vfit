import json
import pytest
from types import SimpleNamespace
from app.services.workout_planner_service import WorkoutPlannerService

def make_exercise(id_, name):
    return SimpleNamespace(id=id_, name=name)

def test_rejects_hallucinated_exercise_id():
    service = WorkoutPlannerService(None, None, None, None)  # deps unused for this method
    eligible = [make_exercise("real-id-123", "Bodyweight Squat")]

    fake_llm_response = json.dumps({
        "days": [{"day_number": 1, "exercises": [{"exercise_id": "fake-id-999", "exercise_name": "Made Up Exercise"}]}]
    })

    with pytest.raises(ValueError, match="invalid exercise_id"):
        service._validate_and_parse(fake_llm_response, eligible)

def test_accepts_valid_exercise_id():
    service = WorkoutPlannerService(None, None, None, None)
    eligible = [make_exercise("real-id-123", "Bodyweight Squat")]

    valid_llm_response = json.dumps({
        "days": [{"day_number": 1, "exercises": [{"exercise_id": "real-id-123", "exercise_name": "Bodyweight Squat"}]}]
    })

    result = service._validate_and_parse(valid_llm_response, eligible)
    assert result["days"][0]["exercises"][0]["exercise_id"] == "real-id-123"