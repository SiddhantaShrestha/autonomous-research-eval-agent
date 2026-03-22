"""
Local paragraph-level retrieval over Markdown files in ``data/``.

Chunks are paragraphs; scoring is simple query–chunk keyword overlap.
"""

from __future__ import annotations

import re
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class ChunkHit:
    """One retrieved paragraph with its source file and relevance score."""

    filename: str
    chunk: str
    score: float


def _default_data_dir() -> Path:
    """Resolve ``data/`` relative to the project root (parent of ``src``)."""
    return Path(__file__).resolve().parent.parent.parent / "data"


def _tokenize(text: str) -> set[str]:
    """Lowercase word tokens (alphanumeric sequences) for overlap scoring."""
    return set(re.findall(r"\w+", text.lower()))


def _split_paragraphs(text: str) -> list[str]:
    """Split Markdown body into paragraph chunks (blank-line separated)."""
    parts = re.split(r"\n\s*\n", text.strip())
    return [p.strip() for p in parts if p.strip()]


def _overlap_score(query_words: set[str], chunk_words: set[str]) -> float:
    """
    Fraction of distinct query terms that appear in the chunk.

    Returns 0.0 if the query has no tokens.
    """
    if not query_words:
        return 0.0
    return len(query_words & chunk_words) / len(query_words)


def _read_markdown_files(data_dir: Path) -> list[tuple[str, str]]:
    """Load all ``*.md`` files from ``data_dir``; returns (filename, contents)."""
    if not data_dir.is_dir():
        return []
    out: list[tuple[str, str]] = []
    for path in sorted(data_dir.glob("*.md")):
        try:
            text = path.read_text(encoding="utf-8")
        except OSError:
            continue
        out.append((path.name, text))
    return out


def retrieve(
    query: str,
    data_dir: Path | None = None,
    *,
    top_k: int = 5,
) -> list[ChunkHit]:
    """
    Score every paragraph in every ``*.md`` file under ``data_dir`` against ``query``,
    then return the top ``top_k`` chunks by keyword overlap score.
    """
    root = data_dir if data_dir is not None else _default_data_dir()
    query_words = _tokenize(query)

    candidates: list[ChunkHit] = []
    for filename, raw in _read_markdown_files(root):
        for para in _split_paragraphs(raw):
            cw = _tokenize(para)
            sc = _overlap_score(query_words, cw)
            candidates.append(ChunkHit(filename=filename, chunk=para, score=sc))

    candidates.sort(key=lambda h: h.score, reverse=True)
    return candidates[:top_k]


if __name__ == "__main__":
    # Smoke test: run from repo root or any cwd; uses default ``data/`` path.
    sample_query = "electric vehicle Nepal charging"
    hits = retrieve(sample_query)
    print(f"Query: {sample_query!r}\n")
    for i, hit in enumerate(hits, start=1):
        print(f"{i}. [{hit.filename}] score={hit.score:.3f}")
        print(hit.chunk[:200] + ("…" if len(hit.chunk) > 200 else ""))
        print()
