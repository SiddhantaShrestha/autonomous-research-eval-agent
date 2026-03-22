"""Revision agent: improve draft using evaluation JSON."""

from __future__ import annotations

from .groq_client import complete_chat
from .prompt_loader import load_prompt


def revise_report(query: str, draft: str, evaluation: str) -> str:
    """Revise the markdown draft using the JSON from ``evaluate_report``."""
    system = load_prompt(
        "reviser",
        "You are a revision agent. Improve the draft using evaluator feedback. "
        "Do not add facts, policies, statistics, or claims not supported by the "
        "original evidence chunks; if something is unknown, say it is unavailable in "
        "the provided sources. Improve structure, completeness, and clarity. Markdown "
        "only—no JSON or preamble.",
    )
    user = (
        f"## User query\n{query}\n\n## Current draft (markdown)\n{draft}\n\n"
        f"## Evaluation (JSON)\n{evaluation}"
    )
    return complete_chat(
        [{"role": "system", "content": system}, {"role": "user", "content": user}],
        temperature=0.4,
    )
