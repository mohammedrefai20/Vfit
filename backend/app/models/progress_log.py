import uuid
from datetime import datetime

from sqlalchemy import DateTime, Float, ForeignKey, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base


class ProgressLog(Base):
    __tablename__ = "progress_logs"

    id: Mapped[uuid.UUID] = mapped_column(primary_key=True, default=uuid.uuid4)

    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True
    )

    weight: Mapped[float] = mapped_column(Float)

    note: Mapped[str] = mapped_column(Text)

    logged_at: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow
    )