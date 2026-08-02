import httpx
from app.core.config import settings


class GroqProvider:
    """Concrete LLMProvider implementation calling Groq's OpenAI-compatible API."""

    BASE_URL = "https://api.groq.com/openai/v1/chat/completions"
    MODEL = "openai/gpt-oss-120b"  # confirm exact name in your Groq console

    def generate(self, messages: list[dict], system_prompt: str) -> str:
        payload = {
            "model": self.MODEL,
            "messages": [{"role": "system", "content": system_prompt}, *messages],
            "temperature": 0.3,
        }
        headers = {"Authorization": f"Bearer {settings.groq_api_key}"}
        response = httpx.post(self.BASE_URL, json=payload, headers=headers, timeout=30)
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]