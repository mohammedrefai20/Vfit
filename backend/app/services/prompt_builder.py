def build_planning_prompt(eligible_exercises: list, volume: "VolumePrescription", training_days: int) -> tuple[str, str]:
    """Build the system + user prompt instructing the LLM to select and arrange exercises from a fixed list."""
    exercise_list = "\n".join(f"- {e.name} (id: {e.id}, muscles: {e.primary_muscles})" for e in eligible_exercises)

    system_prompt = (
        "You are a workout planning assistant. You must ONLY select exercises from the provided list, "
        "using their exact name and id. Never invent an exercise. Respond ONLY in valid JSON, no other text."
    )
    user_prompt = f"""
Available exercises:
{exercise_list}

Create a {training_days}-day workout split.
Each day must include exactly {volume.exercise_count} exercises from the list above.
Each exercise uses {volume.sets} sets of {volume.reps_range[0]}-{volume.reps_range[1]} reps.

Respond in this exact JSON structure:
{{
  "days": [
    {{"day_number": 1, "exercises": [{{"exercise_id": "...", "exercise_name": "..."}}]}}
  ]
}}
"""
    return system_prompt, user_prompt