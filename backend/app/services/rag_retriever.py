from app.providers.embedding_provider import EmbeddingProvider
from app.repositories.knowledge_repository import KnowledgeRepository

class RAGRetriever:
    def __init__(self, embedder: EmbeddingProvider, knowledge_repo: KnowledgeRepository):
        self.embedder = embedder
        self.knowledge_repo = knowledge_repo

    def retrieve(self, query: str, top_k: int = 5) -> list[dict]:
        query_vector = self.embedder.embed(query)
        results = self.knowledge_repo.search(query_vector, limit=top_k)
        return [
            {"book_title": r.payload["book_title"], "chunk_text": r.payload["chunk_text"], "score": r.score}
            for r in results
        ]