"""
Load document text from supported file types (.txt, .md, .pdf).
"""

from __future__ import annotations

import logging
from pathlib import Path

logger = logging.getLogger(__name__)

SUPPORTED_SUFFIXES = frozenset({".txt", ".md", ".pdf"})


def load_text_file(path: Path) -> str | None:
    """Read a text or Markdown file; return stripped text, or None if empty/unreadable."""
    try:
        raw = path.read_bytes()
    except OSError as e:
        logger.warning("Could not read file %s: %s", path, e)
        return None
    text: str | None = None
    for encoding in ("utf-8", "utf-8-sig", "cp1252", "latin-1"):
        try:
            text = raw.decode(encoding)
            break
        except UnicodeDecodeError:
            continue
    if text is None:
        text = raw.decode("utf-8", errors="replace")
        logger.warning("Decoded %s with UTF-8 replacement for invalid bytes", path)
    text = text.strip()
    return text if text else None


def load_pdf_file(path: Path) -> str | None:
    """Extract text from all pages using pypdf; return None if empty or on failure."""
    try:
        from pypdf import PdfReader
    except ImportError as e:
        logger.warning("pypdf is not installed: %s", e)
        return None

    try:
        try:
            reader = PdfReader(str(path), strict=False)
        except TypeError:
            reader = PdfReader(str(path))
    except Exception as e:
        logger.warning("Skipping corrupted or unreadable PDF %s: %s", path, e)
        return None

    parts: list[str] = []
    for i, page in enumerate(reader.pages):
        try:
            t = page.extract_text()
            if t and t.strip():
                parts.append(t)
        except Exception as e:
            logger.warning("PDF page %s extract failed in %s: %s", i, path, e)

    text = "\n\n".join(parts).strip()
    return text if text else None


def load_document(path: Path) -> str | None:
    """
    Load text from a supported file. Returns None if empty, unsupported type, or error.
    """
    if not path.is_file():
        logger.warning("Not a file: %s", path)
        return None

    suffix = path.suffix.lower()
    if suffix not in SUPPORTED_SUFFIXES:
        logger.warning("Unsupported file type (expected .txt, .md, .pdf): %s", path)
        return None

    if suffix in (".txt", ".md"):
        return load_text_file(path)
    if suffix == ".pdf":
        return load_pdf_file(path)
    return None
