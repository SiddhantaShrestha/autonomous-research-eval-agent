"""
Local paragraph-level retrieval over text sources in ``data/`` (or a chosen file or directory).

Chunks are paragraphs; scoring is simple query–chunk keyword overlap.
Supported formats: ``.txt``, ``.md``, ``.pdf`` (see ``document_loaders``).
"""

from __future__ import annotations

import logging
import re
import sys
from dataclasses import dataclass
from pathlib import Path

_SRC = Path(__file__).resolve().parent.parent
if str(_SRC) not in sys.path:
    sys.path.insert(0, str(_SRC))

from tools.document_loaders import SUPPORTED_SUFFIXES, load_document

logger = logging.getLogger(__name__)


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
    """Split body into paragraph chunks (blank-line separated)."""
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


def _display_name(root: Path, path: Path) -> str:
    """Stable label for chunks (basename for single file; relative path under root for dirs)."""
    try:
        rel = path.resolve().relative_to(root.resolve())
        return rel.as_posix()
    except ValueError:
        return path.name


def _iter_supported_paths(root: Path) -> list[Path]:
    """All supported files under ``root`` (recursive)."""
    if not root.is_dir():
        return []
    out: list[Path] = []
    for p in sorted(root.rglob("*")):
        if p.is_file() and p.suffix.lower() in SUPPORTED_SUFFIXES:
            out.append(p)
    return out


def _collect_from_directory(data_dir: Path) -> list[tuple[str, str]]:
    """Load (display_name, text) for every supported file under ``data_dir``."""
    pairs: list[tuple[str, str]] = []
    for path in _iter_supported_paths(data_dir):
        text = load_document(path)
        if text is None:
            continue
        pairs.append((_display_name(data_dir, path), text))
    return pairs


def _collect_from_single_file(path: Path) -> list[tuple[str, str]]:
    """Load one file if supported and non-empty."""
    path = path.resolve()
    text = load_document(path)
    if text is None:
        return []
    return [(path.name, text)]


def retrieve(
    query: str,
    data_dir: Path | None = None,
    *,
    single_file: Path | None = None,
    top_k: int = 5,
) -> list[ChunkHit]:
    """
    Score every paragraph in the selected corpus against ``query``, then return the top
    ``top_k`` chunks by keyword overlap.

    - If ``single_file`` is set, only that file is used (must be ``.txt``, ``.md``, or ``.pdf``).
    - Otherwise all supported files under ``data_dir`` are loaded (recursive). If
      ``data_dir`` is None, the project ``data/`` folder is used.
    """
    if single_file is not None:
        docs = _collect_from_single_file(single_file)
    else:
        root = data_dir if data_dir is not None else _default_data_dir()
        docs = _collect_from_directory(root)

    query_words = _tokenize(query)
    candidates: list[ChunkHit] = []
    for filename, raw in docs:
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
