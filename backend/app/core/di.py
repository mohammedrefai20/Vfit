from functools import lru_cache
from app.core.config import settings

@lru_cache
def get_settings():
    return settings

# Provider/repository factories will be added here in later phases,
# e.g. get_llm_provider(), get_db_session(), get_exercise_repository()