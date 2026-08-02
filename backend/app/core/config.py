from pydantic_settings import BaseSettings



class Settings(BaseSettings):
    app_name: str = "V Fit API"
    environment: str = "development"
    debug: bool = True

    database_url: str = ""

    llm_provider: str = "groq"
    groq_api_key: str = ""

    jwt_secret_key: str = ""
    jwt_algorithm: str = "HS256"
    jwt_expire_minutes: int = 60 * 24


    qdrant_url: str = ""
    qdrant_api_key: str = ""


        
    class Config:
        env_file = ".env"

settings = Settings()
