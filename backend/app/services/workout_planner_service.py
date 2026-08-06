import json
from app.domain.rule_engine import get_volume_prescription
from app.domain.entities import UserConstraints
from app.services.rule_engine_service import RuleEngineService
from app.services.prompt_builder import build_planning_prompt
from app.repositories.workout_repository import WorkoutRepository

class WorkoutPlannerService:
    """Orchestrates rule-engine filtering, LLM planning, and output validation into a saved workout."""

    def __init__(self, rule_engine_service, llm_provider, workout_repository, exercise_repository):
        self.rule_engine_service = rule_engine_service
        self.llm_provider = llm_provider
        self.workout_repository = workout_repository
        self.exercise_repository = exercise_repository

    def generate_plan(self, user_id, profile, plan_name: str) -> dict:
        constraints = UserConstraints(
            experience=profile.experience,
            equipment=profile.equipment.split(","),
            training_location=profile.training_location,
            injuries=[],  # injury handling is a separate confirmed flow, not part of initial generation
        )
        rule_result = self.rule_engine_service.get_candidates(constraints)
        volume = get_volume_prescription(profile.experience, profile.goal)

        system_prompt, user_prompt = build_planning_prompt(
            rule_result.eligible_exercises, volume, profile.training_days
        )
        raw_response = self.llm_provider.generate(
            messages=[{"role": "user", "content": user_prompt}],
            system_prompt=system_prompt,
        ) 

        plan_data = self._validate_and_parse(raw_response, rule_result.eligible_exercises)
        return self.workout_repository.save_new_version(user_id, plan_data, volume, plan_name)

    def _validate_and_parse(self, raw_response: str, eligible_exercises: list) -> dict:
        """Parse LLM JSON output and reject any exercise not present in the eligible candidate list."""
        valid_ids = {str(e.id) for e in eligible_exercises}
        parsed = json.loads(raw_response)

        for day in parsed["days"]:
            for exercise in day["exercises"]:
                if exercise["exercise_id"] not in valid_ids:
                    raise ValueError(f"LLM returned invalid exercise_id: {exercise['exercise_id']}")

        return parsed