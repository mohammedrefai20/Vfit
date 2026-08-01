import sys
from app.services.pdf_extractor import extract_clean_text
from app.services.chunker import chunk_text
from app.providers.embedding_provider import EmbeddingProvider
from app.repositories.knowledge_repository import KnowledgeRepository
from app.core.config import settings

def ingest_book(pdf_path: str, book_title: str, skip_first: int, skip_last: int):
    text = extract_clean_text(pdf_path, skip_first, skip_last)
    chunks = chunk_text(text)
    print(len(chunks))
    print(chunks[0][:200] if chunks else "NO CHUNKS")
    print(f"{book_title}: {len(chunks)} chunks")
    print(f"Connecting to Qdrant at: {settings.qdrant_url}")
    embedder = EmbeddingProvider()
    vectors = embedder.embed_batch(chunks)

    repo = KnowledgeRepository(settings.qdrant_url, settings.qdrant_api_key)
    repo.ensure_collection(vector_size=len(vectors[0]))
    repo.upsert_chunks(chunks, vectors, book_title)
    print(f"Ingested {book_title}.")

if __name__ == "__main__":
    # Run once per book, adjusting skip_first/skip_last after inspecting each PDF
    # ingest_book(r"E:\ITI_AI\Vfit\backend\data\Gym Database\Guidelines for Exercise Testing and Prescription Twelfth Edition.pdf", "Guidelines for Exercise Testing and Prescription", skip_first=80, skip_last=140)
    # ingest_book(r"E:\ITI_AI\Vfit\backend\data\Gym Database\basics of strength and conditioning manual.pdf", "basics of strength and conditioning manual", skip_first=8, skip_last=5)
    # ingest_book(r"E:\ITI_AI\Vfit\backend\data\Gym Database\frederic-delavier-strength-training-anatomy-first-edition.pdf", "frederic delavier strength training anatomy", skip_first=6, skip_last=2)
    # ingest_book(r"E:\ITI_AI\Vfit\backend\data\Gym Database\Mark Rippetoe - Starting Strength, 3rd edition-The Aasgaard Company (2011).pdf", "Starting Strength", skip_first=5, skip_last=9)
    ingest_book(r"E:\ITI_AI\Vfit\backend\data\Gym Database\Practical Programming for strength Training.pdf", "Practical Programming for strength Training", skip_first=8, skip_last=7)
    # ingest_book(r"E:\ITI_AI\Vfit\backend\data\Gym Database\Science and development of muscle hypertrophy.pdf", "Science and development of muscle hypertrophy", skip_first=9, skip_last=73)
    