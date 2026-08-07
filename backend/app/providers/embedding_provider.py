import httpx
from app.core.config import settings

class EmbeddingProvider:
    """Calls Hugging Face's hosted Inference API instead of loading the model locally —
    keeps the deployed app lightweight (no torch/transformers in production)."""

    API_URL = "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-MiniLM-L6-v2"

    def embed(self, text: str) -> list[float]:
        return self.embed_batch([text])[0]

    def embed_batch(self, texts: list[str]) -> list[list[float]]:
        headers = {"Authorization": f"Bearer {settings.hf_api_token}"}
        response = httpx.post(self.API_URL, json={"inputs": texts}, headers=headers, timeout=30)
        response.raise_for_status()
        return response.json()