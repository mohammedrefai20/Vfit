KNOWLEDGE_KEYWORDS = {
    "why", "how does", "explain", "hypertrophy", "muscle", "recovery",
    "periodization", "volume", "overload", "science", "study", "research",
    "protein", "adaptation", "mechanism",
}

def is_knowledge_heavy(message: str) -> bool | None:
    """Heuristic check: True if likely knowledge-heavy, False if likely simple, None if ambiguous."""
    lowered = message.lower().strip()

    if len(lowered.split()) <= 3:
        return False  # short greetings/small talk

    if any(keyword in lowered for keyword in KNOWLEDGE_KEYWORDS):
        return True

    return None  # ambiguous - needs LLM fallback classification