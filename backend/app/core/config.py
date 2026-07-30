from pydantic_settings import BaseSettings

jwt_secret_key: str = ""
jwt_algorithm: str = "HS256"
jwt_expire_minutes: int = 60 * 24  # 24 hours

class Settings(BaseSettings):
    app_name: str = "V Fit API"
    environment: str = "development"
    debug: bool = True

    # Populated in later phases, defined now so the shape is known
    database_url: str = ""
    llm_provider: str = "grok"
    grok_api_key: str = ""

    class Config:
        env_file = ".env"

settings = Settings()
