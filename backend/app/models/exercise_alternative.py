import uuid
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import Base

class ExerciseAlternative(Base):
    __tablename__ = "exercise_alternatives"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)
    exercise_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("exercises.id"), index=True)
    alternative_exercise_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("exercises.id"))