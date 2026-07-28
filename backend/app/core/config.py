from pydantic_settings import BaseSettings

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