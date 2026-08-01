from pypdf import PdfReader
import re

def extract_clean_text(pdf_path: str, skip_first_pages: int = 0, skip_last_pages: int = 0) -> str:
    reader = PdfReader(pdf_path)
    pages = reader.pages[skip_first_pages: len(reader.pages) - skip_last_pages]
    raw_text = "\n".join(page.extract_text() or "" for page in pages)

    # Remove common noise patterns: repeated headers/footers, page numbers, excess whitespace
    text = re.sub(r"\n\s*\d+\s*\n", "\n", raw_text)  # standalone page numbers
    text = re.sub(r"\n{3,}", "\n\n", text)             # collapse excess blank lines
    return text.strip()