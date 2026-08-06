def explain_replacement(original_name: str, new_name: str, shared_muscles: str) -> str:
    """Generate a short, templated explanation for why an exercise was swapped."""
    return f"Swapped {original_name} for {new_name} — both target {shared_muscles}, selected from your approved alternatives."