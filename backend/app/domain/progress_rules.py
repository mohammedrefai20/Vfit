from datetime import datetime, timedelta, timezone

def is_checkin_due(last_logged_at: datetime | None) -> bool:
    """A check-in is due if the user has never logged, or it's been 7+ days since the last entry."""
    if last_logged_at is None:
        return True
    return datetime.now(timezone.utc) - last_logged_at >= timedelta(days=7)