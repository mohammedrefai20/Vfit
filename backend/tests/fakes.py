import json

class FakeLLMProvider:
    """Deterministic stand-in for GroqProvider — returns canned responses, no network call."""

    def __init__(self, response: str = "Hello! How can I help?"):
        self.response = response
        self.calls = []

    def generate(self, messages, system_prompt):
        self.calls.append({"messages": messages, "system_prompt": system_prompt})
        return self.response


def make_fake_plan_response(exercise_id: str, exercise_name: str, days=1):
    return json.dumps({
        "days": [
            {"day_number": d + 1, "exercises": [{"exercise_id": exercise_id, "exercise_name": exercise_name}]}
            for d in range(days)
        ]
    })