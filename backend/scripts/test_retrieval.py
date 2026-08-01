from app.services.rag_retriever import RAGRetriever
from app.providers.embedding_provider import EmbeddingProvider
from app.repositories.knowledge_repository import KnowledgeRepository
from app.core.config import settings

retriever = RAGRetriever(
    EmbeddingProvider(),
    KnowledgeRepository(settings.qdrant_url, settings.qdrant_api_key),
)
results = retriever.retrieve("What is progressive overload?")
for r in results:
    print(f"[{r['score']:.3f}] {r['book_title']}: {r['chunk_text'][:150]}...")