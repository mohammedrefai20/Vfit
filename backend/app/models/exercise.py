import uuid

from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column
from typing import Optional

from app.models.base import Base


class Exercise(Base):
    __tablename__ = "exercises"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)

    name: Mapped[str] = mapped_column(String(255), unique=True)

    primary_muscles: Mapped[str] = mapped_column(String(255))
    secondary_muscles: Mapped[str] = mapped_column(String(255))

    equipment: Mapped[str] = mapped_column(String(100))
    difficulty: Mapped[str] = mapped_column(String(50))
    movement_type: Mapped[str] = mapped_column(String(50))

    instructions: Mapped[str] = mapped_column(Text)
    contraindications: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    youtube_url: Mapped[str] = mapped_column(String(500))