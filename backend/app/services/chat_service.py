from datetime import datetime, timedelta, timezone
from app.domain.chat_router import is_knowledge_heavy

class ChatService:
    """Routes chat messages to direct-LLM or RAG-grounded responses, with optional persisted memory."""

    def __init__(self, llm_provider, rag_retriever, chat_repository):
        self.llm_provider = llm_provider
        self.rag_retriever = rag_retriever
        self.chat_repository = chat_repository

    def handle_message(self, message: str, user_id=None, session_id=None) -> dict:
        history = []
        if user_id is not None:
            session = self.chat_repository.get_active_session(user_id, session_id)
            if session is not None:
                history = session.messages

        needs_rag = is_knowledge_heavy(message)
        if needs_rag is None:
            needs_rag = classify_with_llm(message, self.llm_provider)

        if needs_rag:
            reply = self._answer_with_rag(message, history)
        else:
            reply = self._answer_direct(message, history)

        if user_id is not None:
            session_id = self.chat_repository.append_message(user_id, session_id, message, reply)
        else:
            session_id = None  # visitors never get a real session_id

        return {"reply": reply, "session_id": session_id, "used_rag": needs_rag}

    def _answer_direct(self, message: str, history: list) -> str:
        system_prompt = "You are a friendly fitness assistant. Answer simply and conversationally."
        messages = history + [{"role": "user", "content": message}]
        return self.llm_provider.generate(messages=messages, system_prompt=system_prompt)

    
    def _answer_with_rag(self, message: str, history: list) -> str:
        chunks = self.rag_retriever.retrieve(message, top_k=4)
        context = "\n\n".join(f"[{c['book_title']}]: {c['chunk_text']}" for c in chunks)
        system_prompt = (
            "You are a fitness assistant. Answer using ONLY the provided reference material below. "
            "If the material doesn't cover the question, say so honestly rather than guessing.\n\n"
            f"Reference material:\n{context}"
        )
        messages = history + [{"role": "user", "content": message}]
        return self.llm_provider.generate(messages=messages, system_prompt=system_prompt)

def classify_with_llm(message: str, llm_provider) -> bool:
    system_prompt = "Classify the message as KNOWLEDGE or SIMPLE. Respond with exactly one word."
    result = llm_provider.generate(messages=[{"role": "user", "content": message}], system_prompt=system_prompt)
    return result.strip().upper() == "KNOWLEDGE"