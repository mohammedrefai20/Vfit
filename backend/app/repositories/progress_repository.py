from datetime import datetime, timezone
from app.models.progress_log import ProgressLog

class ProgressRepository:
    """Handles creating and retrieving a user's weekly progress entries."""

    def __init__(self, db):
        self.db = db

    def create(self, user_id, weight: float, note: str | None) -> ProgressLog:
        entry = ProgressLog(user_id=user_id, weight=weight, note=note)
        self.db.add(entry)
        self.db.commit()
        self.db.refresh(entry)
        return entry

    def get_history(self, user_id) -> list[ProgressLog]:
        return (
            self.db.query(ProgressLog)
            .filter(ProgressLog.user_id == user_id)
            .order_by(ProgressLog.logged_at.desc())
            .all()
        )

    def get_latest(self, user_id) -> ProgressLog | None:
        return (
            self.db.query(ProgressLog)
            .filter(ProgressLog.user_id == user_id)
            .order_by(ProgressLog.logged_at.desc())
            .first()
        )