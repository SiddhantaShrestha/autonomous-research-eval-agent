"""Load optional prompt text from ``src/prompts/{name}.txt``."""

from __future__ import annotations

from pathlib import Path

_PROMPTS_DIR = Path(__file__).resolve().parent.parent / "prompts"


def load_prompt(name: str, fallback: str) -> str:
    """Return file contents when non-empty; otherwise ``fallback``."""
    path = _PROMPTS_DIR / f"{name}.txt"
    try:
        if path.is_file():
            text = path.read_text(encoding="utf-8").strip()
            if text:
                return text
    except OSError:
        pass
    return fallback
