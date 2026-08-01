from qdrant_client import QdrantClient
from app.core.config import settings

client = QdrantClient(url=settings.qdrant_url, api_key=settings.qdrant_api_key)

# Scroll through all points and collect distinct book titles + counts
book_counts = {}
offset = None

while True:
    points, offset = client.scroll(
        collection_name="Vfit_knowledge",
        limit=200,
        offset=offset,
        with_payload=True,
        with_vectors=False,
    )
    for point in points:
        title = point.payload.get("book_title", "UNKNOWN")
        book_counts[title] = book_counts.get(title, 0) + 1

    if offset is None:
        break

print(f"Total books found: {len(book_counts)}")
for title, count in book_counts.items():
    print(f"  {title}: {count} chunks")