from fastapi import APIRouter, Depends
from pydantic import BaseModel
from app.core.di import get_chat_service, get_optional_current_user

router = APIRouter()

class ChatRequest(BaseModel):
    message: str
    session_id: str | None = None

@router.post("")
def chat(payload: ChatRequest, current_user=Depends(get_optional_current_user), chat_service=Depends(get_chat_service)):
    user_id = current_user.id if current_user else None
    return chat_service.handle_message(payload.message, user_id=user_id, session_id=payload.session_id)


# @router.post("")
# def chat(payload: ChatRequest, current_user=Depends(get_optional_current_user), chat_service=Depends(get_chat_service)):
#     print(f"DEBUG current_user: {current_user}")  # temporary
#     user_id = current_user.id if current_user else None
#     return chat_service.handle_message(payload.message, user_id=user_id, session_id=payload.session_id)