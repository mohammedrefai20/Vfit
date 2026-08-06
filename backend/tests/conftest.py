import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from sqlalchemy.pool import StaticPool

from app.main import app
from app.models.base import Base

# Import every model so Base.metadata actually knows about their tables —
# without these, create_all() sees empty metadata and creates nothing.
from app.models.user import User
from app.models.profile import Profile
from app.models.exercise import Exercise
from app.models.exercise_alternative import ExerciseAlternative
from app.models.workout import Workout
from app.models.workout_exercise import WorkoutExercise
from app.models.progress_log import ProgressLog
from app.models.chat_session import ChatSession

from app.core.di import get_db_session

TEST_DATABASE_URL = "sqlite:///:memory:"

@pytest.fixture
def db_session():
    engine = create_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    Base.metadata.create_all(engine)
    TestingSessionLocal = sessionmaker(bind=engine)
    session = TestingSessionLocal()
    yield session
    session.close()
    Base.metadata.drop_all(engine)

@pytest.fixture
def client(db_session):
    def override_get_db():
        yield db_session
    app.dependency_overrides[get_db_session] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()