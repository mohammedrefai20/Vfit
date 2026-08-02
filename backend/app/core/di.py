from functools import lru_cache
from app.repositories.profile_repository import ProfileRepository
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, Session
from app.core.config import settings
from app.repositories.user_repository import UserRepository
from app.services.auth_service import AuthService
from fastapi import Depends, HTTPException,Header
from fastapi.security import OAuth2PasswordBearer ,HTTPBearer, HTTPAuthorizationCredentials
from app.core.security import decode_access_token
from app.models.user import User
from app.providers.groq_provider import GroqProvider
from app.repositories.workout_repository import WorkoutRepository
from app.repositories.exercise_repository import ExerciseRepository
from app.services.rule_engine_service import RuleEngineService
from app.services.workout_planner_service import WorkoutPlannerService
from app.repositories.chat_repository import ChatRepository
from app.services.chat_service import ChatService
from app.services.rag_retriever import RAGRetriever
from app.providers.embedding_provider import EmbeddingProvider
from app.repositories.knowledge_repository import KnowledgeRepository

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")
bearer_scheme = HTTPBearer()
optional_bearer_scheme = HTTPBearer(auto_error=False)

@lru_cache
def get_settings():
    return settings

engine = create_engine(settings.database_url)
SessionLocal = sessionmaker(bind=engine)

def get_db_session() -> Session:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
        
def get_user_repository(db: Session = Depends(get_db_session)) -> UserRepository:
    return UserRepository(db)


def get_profile_repository(db: Session = Depends(get_db_session)) -> ProfileRepository:
    return ProfileRepository(db)

def get_auth_service(repo: UserRepository = Depends(get_user_repository)) -> AuthService:
    return AuthService(repo)
# Provider/repository factories will be added here in later phases,
# e.g. get_llm_provider(), get_db_session(), get_exercise_repository()





def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    repo: UserRepository = Depends(get_user_repository),
) -> User:
    token = credentials.credentials
    user_id = decode_access_token(token)
    if user_id is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token")
    user = repo.get_by_id(user_id)
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user


def get_groq_provider() -> GroqProvider:
    return GroqProvider()

def get_workout_repository(db: Session = Depends(get_db_session)) -> WorkoutRepository:
    return WorkoutRepository(db)

def get_exercise_repository(db: Session = Depends(get_db_session)) -> ExerciseRepository:
    return ExerciseRepository(db)

def get_rule_engine_service(exercise_repo: ExerciseRepository = Depends(get_exercise_repository)) -> RuleEngineService:
    return RuleEngineService(exercise_repo)

def get_workout_planner_service(
    rule_engine_service: RuleEngineService = Depends(get_rule_engine_service),
    llm_provider: GroqProvider = Depends(get_groq_provider),
    workout_repo: WorkoutRepository = Depends(get_workout_repository),
    exercise_repo: ExerciseRepository = Depends(get_exercise_repository),
) -> WorkoutPlannerService:
    return WorkoutPlannerService(rule_engine_service, llm_provider, workout_repo, exercise_repo)

def get_optional_current_user(
        credentials: HTTPAuthorizationCredentials | None = Depends(optional_bearer_scheme),
        repo: UserRepository = Depends(get_user_repository),
    ) -> User | None:
        if credentials is None:
            return None
        user_id = decode_access_token(credentials.credentials)
        if user_id is None:
            return None
        return repo.get_by_id(user_id)


def get_chat_repository(db: Session = Depends(get_db_session)) -> ChatRepository:
    return ChatRepository(db)

def get_knowledge_repository() -> KnowledgeRepository:
    return KnowledgeRepository(settings.qdrant_url, settings.qdrant_api_key)

def get_embedding_provider() -> EmbeddingProvider:
    return EmbeddingProvider()

def get_rag_retriever(
    embedder: EmbeddingProvider = Depends(get_embedding_provider),
    knowledge_repo: KnowledgeRepository = Depends(get_knowledge_repository),
) -> RAGRetriever:
    return RAGRetriever(embedder, knowledge_repo)

def get_chat_service(
    llm_provider: GroqProvider = Depends(get_groq_provider),
    rag_retriever: RAGRetriever = Depends(get_rag_retriever),
    chat_repository: ChatRepository = Depends(get_chat_repository),
) -> ChatService:
    return ChatService(llm_provider, rag_retriever, chat_repository)