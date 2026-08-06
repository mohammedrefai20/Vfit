from datetime import datetime, timedelta, timezone
from app.domain.progress_rules import is_checkin_due

def test_due_when_never_logged():
    assert is_checkin_due(None) is True

def test_not_due_within_a_week():
    recent = datetime.now(timezone.utc) - timedelta(days=2)
    assert is_checkin_due(recent) is False

def test_due_after_a_week():
    old = datetime.now(timezone.utc) - timedelta(days=8)
    assert is_checkin_due(old) is True