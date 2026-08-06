from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.core.di import get_chat_repository, get_chat_service, get_optional_current_user,get_current_user


router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    session_id: str | None = None



class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    session_id: str | None = None
    history: list[ChatMessage] | None = None

@router.post("")
def chat(payload: ChatRequest, current_user=Depends(get_optional_current_user), chat_service=Depends(get_chat_service)):
    user_id = current_user.id if current_user else None
    client_history = [m.model_dump() for m in payload.history] if payload.history else []
    return chat_service.handle_message(payload.message, user_id=user_id, session_id=payload.session_id, client_history=client_history)

@router.delete("/{session_id}")
def delete_chat_session(session_id: str, current_user=Depends(get_current_user), chat_repo=Depends(get_chat_repository)):
    chat_repo.delete_session(current_user.id, session_id)
    return {"status": "deleted"}


# @router.post("")
# def chat(payload: ChatRequest, current_user=Depends(get_optional_current_user), chat_service=Depends(get_chat_service)):
#     print(f"DEBUG current_user: {current_user}")  # temporary
#     user_id = current_user.id if current_user else None
#     return chat_service.handle_message(payload.message, user_id=user_id, session_id=payload.session_id)