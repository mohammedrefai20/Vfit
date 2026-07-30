import uuid

from sqlalchemy import Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class Profile(Base):
    __tablename__ = "profiles"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)

    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)

    age: Mapped[int] = mapped_column(Integer)
    sex: Mapped[str] = mapped_column(String(20))
    height: Mapped[float] = mapped_column(Float)
    weight: Mapped[float] = mapped_column(Float)

    goal: Mapped[str] = mapped_column(String(100))
    experience: Mapped[str] = mapped_column(String(50))
    training_location: Mapped[str] = mapped_column(String(50))
    equipment: Mapped[str] = mapped_column(String(500))
    training_days: Mapped[int] = mapped_column(Integer)