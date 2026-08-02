from app.domain.entities import UserConstraints, RuleEngineResult, VolumePrescription

def filter_by_equipment(exercises: list, available_equipment: list[str]) -> tuple[list, list]:
    """Exclude exercises harder than the user's experience level allows."""

    eligible, excluded = [], []
    available_lower = {e.lower() for e in available_equipment}

    for exercise in exercises:
        required = {e.strip().lower() for e in exercise.equipment.split(",")}
        if required.issubset(available_lower) or "none (bodyweight)" in required:
            eligible.append(exercise)
        else:
            excluded.append((exercise, f"requires equipment you don't have: {exercise.equipment}"))

    return eligible, excluded


DIFFICULTY_RANK = {"beginner": 1, "intermediate": 2, "advanced": 3}

def filter_by_experience(exercises: list, user_experience: str) -> tuple[list, list]:
    '''Keep only exercises whose difficulty is appropriate for the user's experience level.'''
    
    eligible, excluded = [], []
    user_rank = DIFFICULTY_RANK.get(user_experience.lower(), 1)

    for exercise in exercises:
        exercise_rank = DIFFICULTY_RANK.get(exercise.difficulty.lower(), 1)
        if exercise_rank <= user_rank:
            eligible.append(exercise)
        else:
            excluded.append((exercise, f"too advanced for {user_experience} level"))

    return eligible, excluded


def filter_by_injuries(exercises: list, injuries: list[str]) -> tuple[list, list]:
    ''''Exclude exercises matching reported injury keywords in contraindications or muscle groups.'''
    if not injuries:
        return exercises, []

    eligible, excluded = [], []
    injury_keywords = {i.lower() for i in injuries}

    for exercise in exercises:
        contraindication_text = (exercise.contraindications or "").lower()
        muscle_text = f"{exercise.primary_muscles} {exercise.secondary_muscles}".lower()

        flagged = any(
            keyword in contraindication_text or keyword in muscle_text
            for keyword in injury_keywords
        )
        if flagged:
            excluded.append((exercise, f"excluded due to reported injury: {', '.join(injuries)}"))
        else:
            eligible.append(exercise)

    return eligible, excluded


def apply_rules(exercises: list, constraints: UserConstraints) -> RuleEngineResult:
    ''''Run equipment, experience, and injury filters in sequence; return eligible + excluded-with-reasons.'''
    all_excluded = []

    eligible, excluded = filter_by_equipment(exercises, constraints.equipment)
    all_excluded.extend(excluded)

    eligible, excluded = filter_by_experience(eligible, constraints.experience)
    all_excluded.extend(excluded)

    eligible, excluded = filter_by_injuries(eligible, constraints.injuries)
    all_excluded.extend(excluded)

    return RuleEngineResult(eligible_exercises=eligible, excluded_exercises=all_excluded)

# Deterministic volume table: (experience, goal) -> prescription
# Grounded in general strength/hypertrophy programming principles
# (progressive overload, lower volume for beginners to manage recovery/technique load)
VOLUME_TABLE = {
    ("beginner", "strength"):     VolumePrescription(exercise_count=5, sets=3, reps_range=(5, 8)),
    ("beginner", "hypertrophy"):  VolumePrescription(exercise_count=5, sets=3, reps_range=(10, 12)),
    ("beginner", "general"):      VolumePrescription(exercise_count=5, sets=2, reps_range=(10, 15)),

    ("intermediate", "strength"):    VolumePrescription(exercise_count=6, sets=4, reps_range=(4, 6)),
    ("intermediate", "hypertrophy"): VolumePrescription(exercise_count=6, sets=3, reps_range=(8, 12)),
    ("intermediate", "general"):     VolumePrescription(exercise_count=6, sets=3, reps_range=(10, 15)),

    ("advanced", "strength"):     VolumePrescription(exercise_count=7, sets=5, reps_range=(3, 6)),
    ("advanced", "hypertrophy"):  VolumePrescription(exercise_count=7, sets=4, reps_range=(8, 12)),
    ("advanced", "general"):      VolumePrescription(exercise_count=7, sets=3, reps_range=(12, 15)),
}

def get_volume_prescription(experience: str, goal: str) -> VolumePrescription:
    """Look up the deterministic exercise count/sets/reps target for a given experience level and goal."""
    key = (experience.lower(), goal.lower())
    return VOLUME_TABLE.get(key, VOLUME_TABLE[("beginner", "general")])  # safe fallback

