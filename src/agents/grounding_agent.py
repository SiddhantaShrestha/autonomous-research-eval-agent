"""Grounding audit agent: validate final report claims against retrieved evidence chunks."""

from __future__ import annotations

import json
import re

from pydantic import ValidationError

from .groq_client import complete_chat
from .prompt_loader import load_prompt
from schemas.grounding_audit_schema import GroundingAuditResult
from tools.retrieval_tool import ChunkHit


def _strip_json_fence(text: str) -> str:
    t = text.strip()
    m = re.match(r"^```(?:json)?\s*\n?(.*?)\n?```\s*$", t, re.DOTALL | re.IGNORECASE)
    if m:
        return m.group(1).strip()
    return t


def _format_evidence(chunks: list[ChunkHit]) -> str:
    if not chunks:
        return "(No evidence chunks were provided.)"
    lines = [
        f"### {h.filename} (retrieval score={h.score:.3f})\n{h.chunk}"
        for h in chunks
    ]
    return "\n\n".join(lines)


def audit_grounding(query: str, final_report: str, chunks: list[ChunkHit]) -> GroundingAuditResult:
    """
    Audit whether ``final_report`` claims are supported by ``chunks`` (same evidence used for drafting).

    Returns a validated ``GroundingAuditResult``. Raises ``RuntimeError`` if the model output is not
    valid JSON or does not match the schema.
    """
    system = load_prompt(
        "grounding_auditor",
        "You are a grounding audit agent. Check whether the claims in the final report "
        "are supported by the provided evidence chunks only—no outside knowledge. A claim "
        "is supported only if clearly grounded; partial support that overstates the evidence "
        "counts as unsupported. Return ONLY valid JSON with keys: grounding_score (int 1–10), "
        "supported_points, unsupported_points, notes (all string arrays). No markdown or text "
        "outside JSON. Scoring: 9–10 almost all supported; 7–8 mostly grounded; 4–6 mixed; "
        "1–3 major issues.",
    )
    evidence = _format_evidence(chunks)
    user = (
        f"## User query\n{query}\n\n## Evidence chunks\n{evidence}\n\n"
        f"## Final report (markdown)\n{final_report}"
    )
    raw = complete_chat(
        [
            {"role": "system", "content": system},
            {"role": "user", "content": user},
        ],
        response_format={"type": "json_object"},
        temperature=0.2,
    )
    cleaned = _strip_json_fence(raw)
    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError as e:
        raise RuntimeError(
            f"Grounding auditor did not return valid JSON: {e}\nRaw: {raw[:500]}"
        ) from e
    try:
        return GroundingAuditResult.model_validate(data)
    except ValidationError as e:
        raise RuntimeError(f"Grounding auditor JSON does not match schema: {e}") from e
