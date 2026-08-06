import uuid
from datetime import datetime, timedelta, timezone
from app.models.chat_session import ChatSession

class ChatRepository:
    """Persists chat sessions for registered users only; visitors are never written to the DB."""

    def __init__(self, db):
        self.db = db

    def append_message(self, user_id, session_id, user_message: str, assistant_reply: str) -> str:
        if session_id:
            session = self.db.query(ChatSession).filter(ChatSession.id == session_id).first()
        else:
            session = None

        now = datetime.now(timezone.utc)

        if session is None or session.expires_at < now:
            session = ChatSession(
                id=uuid.uuid4(), user_id=user_id, messages=[], expires_at=now + timedelta(hours=24)
            )
            self.db.add(session)

        session.messages = session.messages + [
            {"role": "user", "content": user_message},
            {"role": "assistant", "content": assistant_reply},
        ]
        self.db.commit()
        self.db.refresh(session)
        return str(session.id)
    


    def get_active_session(self, user_id, session_id):
        """Return the session if it exists, belongs to this user, and hasn't expired; else None."""
        if not session_id:
            return None
        try:
            session_uuid = uuid.UUID(str(session_id))
        except (ValueError, AttributeError):
            return None  # not a real UUID - treat as "no session", not a crash

        session = self.db.query(ChatSession).filter(
            ChatSession.id == session_uuid, ChatSession.user_id == user_id
        ).first()
        if session is None:
            return None
        if session.expires_at < datetime.now(timezone.utc):
            return None
        return session
    def delete_session(self, user_id, session_id):
        session = self.db.query(ChatSession).filter(ChatSession.id == session_id, ChatSession.user_id == user_id).first()
        if session:
            self.db.delete(session)
            self.db.commit()