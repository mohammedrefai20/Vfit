from fastapi import APIRouter, Depends
from app.core.di import get_current_user, get_progress_repository
from app.domain.progress_rules import is_checkin_due
from app.schemas.progress import ProgressCreate, ProgressEntry
from app.models.user import User
from app.repositories.progress_repository import ProgressRepository

router = APIRouter()

@router.post("")
def log_progress(
    payload: ProgressCreate,
    current_user: User = Depends(get_current_user),
    repo: ProgressRepository = Depends(get_progress_repository),
):
    entry = repo.create(current_user.id, payload.weight, payload.note)
    return {"id": str(entry.id), "logged_at": entry.logged_at}

@router.get("", response_model=list[ProgressEntry])
def get_progress_history(
    current_user: User = Depends(get_current_user),
    repo: ProgressRepository = Depends(get_progress_repository),
):
    entries = repo.get_history(current_user.id)
    return [ProgressEntry(id=str(e.id), weight=e.weight, note=e.note, logged_at=e.logged_at) for e in entries]

@router.get("/due")
def check_if_due(
    current_user: User = Depends(get_current_user),
    repo: ProgressRepository = Depends(get_progress_repository),
):
    latest = repo.get_latest(current_user.id)
    due = is_checkin_due(latest.logged_at if latest else None)
    return {"due": due}