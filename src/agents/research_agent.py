"""Research (draft generation) agent."""

from __future__ import annotations

from .groq_client import complete_chat
from .prompt_loader import load_prompt
from tools.retrieval_tool import ChunkHit


def generate_draft_report(query: str, chunks: list[ChunkHit]) -> str:
    """Produce a markdown research draft from the user query and retrieved chunks."""
    system = load_prompt(
        "researcher",
        "You are a research analyst. Use only the provided evidence chunks; do not "
        "introduce facts, policies, statistics, or claims not directly supported by "
        "those chunks; if information is missing, say it is unavailable in the "
        "provided sources. Output markdown: Executive Summary; Key Findings; "
        "Supporting Evidence (cite by filename); Gaps and Uncertainties; Conclusion.",
    )
    if not chunks:
        evidence = "(No passages were retrieved from data/.)"
    else:
        lines = [
            f"### Source {i}: {h.filename} (score={h.score:.3f})\n{h.chunk}"
            for i, h in enumerate(chunks, start=1)
        ]
        evidence = "\n\n".join(lines)
    user = f"## User query\n{query}\n\n## Retrieved evidence\n{evidence}"
    return complete_chat(
        [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        temperature=0.6,
    )
