from types import SimpleNamespace
from app.domain.rule_engine import apply_rules, get_volume_prescription
from app.domain.entities import UserConstraints

def make_exercise(**kwargs):
    defaults = {
        "name": "Test Exercise", "equipment": "Bodyweight", "difficulty": "Beginner",
        "primary_muscles": "Legs", "secondary_muscles": "", "contraindications": "",
    }
    defaults.update(kwargs)
    return SimpleNamespace(**defaults)

def test_excludes_exercise_requiring_unavailable_equipment():
    exercises = [make_exercise(name="Barbell Squat", equipment="Barbell, Squat Rack")]
    constraints = UserConstraints(experience="Beginner", equipment=["Dumbbells"], training_location="Home", injuries=[])
    result = apply_rules(exercises, constraints)
    assert len(result.eligible_exercises) == 0
    assert "equipment" in result.excluded_exercises[0][1]

def test_excludes_advanced_exercise_for_beginner():
    exercises = [make_exercise(name="Deadlift", equipment="Bodyweight", difficulty="Advanced")]
    constraints = UserConstraints(experience="Beginner", equipment=["Bodyweight"], training_location="Home", injuries=[])
    result = apply_rules(exercises, constraints)
    assert len(result.eligible_exercises) == 0

def test_excludes_exercise_matching_injury_keyword():
    exercises = [make_exercise(name="Overhead Press", contraindications="Avoid with shoulder injury")]
    constraints = UserConstraints(experience="Beginner", equipment=["Bodyweight"], training_location="Home", injuries=["shoulder"])
    result = apply_rules(exercises, constraints)
    assert len(result.eligible_exercises) == 0

def test_eligible_exercise_passes_all_filters():
    exercises = [make_exercise(name="Bodyweight Squat")]
    constraints = UserConstraints(experience="Intermediate", equipment=["Bodyweight"], training_location="Home", injuries=[])
    result = apply_rules(exercises, constraints)
    assert len(result.eligible_exercises) == 1

def test_volume_prescription_advanced_strength():
    result = get_volume_prescription("Advanced", "Strength")
    assert result.exercise_count == 7
    assert result.sets == 5

def test_volume_prescription_unknown_falls_back_safely():
    result = get_volume_prescription("unknown", "unknown")
    assert result.exercise_count == 5  # beginner/general fallback