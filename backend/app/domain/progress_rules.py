from datetime import datetime, timedelta, timezone


def is_checkin_due(last_logged_at: datetime | None) -> bool:
    if last_logged_at is None:
        return True

    # SQLite returns naive datetimes even when timezone=True
    if last_logged_at.tzinfo is None:
        last_logged_at = last_logged_at.replace(tzinfo=timezone.utc)

    return datetime.now(timezone.utc) - last_logged_at >= timedelta(days=7)