import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, JSON

from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base



class ChatSession(Base):
    __tablename__ = "chat_sessions"

    id: Mapped[uuid.UUID] = mapped_column(
        primary_key=True,
        default=uuid.uuid4
    )

    user_id: Mapped[uuid.UUID] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)

    messages: Mapped[dict] = mapped_column(JSON, default=list)

    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True))