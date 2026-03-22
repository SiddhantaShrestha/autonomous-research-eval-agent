"""Evaluation agent: score draft vs query, return validated JSON string."""

from __future__ import annotations

import json
import re

from pydantic import ValidationError

from .groq_client import complete_chat
from .prompt_loader import load_prompt
from schemas.evaluation_schema import EvaluationResult


def _align_overall_score(result: EvaluationResult) -> EvaluationResult:
    """Set ``score`` to the mean of the four subscores (1–10), one decimal."""
    sub = (
        result.relevance
        + result.completeness
        + result.clarity
        + result.evidence_usage
    ) / 4.0
    return result.model_copy(update={"score": round(sub, 1)})


def _strip_json_fence(text: str) -> str:
    t = text.strip()
    m = re.match(r"^```(?:json)?\s*\n?(.*?)\n?```\s*$", t, re.DOTALL | re.IGNORECASE)
    if m:
        return m.group(1).strip()
    return t


def evaluate_report(query: str, draft: str) -> str:
    """Return strict JSON string matching ``EvaluationResult`` (no prose outside JSON)."""
    system = load_prompt(
        "evaluator",
        "You are an evaluation agent. Evaluate the draft against the query. Return "
        "ONLY valid JSON: score (float 1–10), relevance, completeness, clarity, "
        "evidence_usage (ints 1–10 each), issues, suggested_fixes. Be strict; "
        "subscores must be internally consistent with overall score (overall ≈ average "
        "of the four). No markdown or text outside JSON.",
    )
    user = f"## Query\n{query}\n\n## Draft report (markdown)\n{draft}"
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
        raise RuntimeError(f"Evaluator did not return valid JSON: {e}\nRaw: {raw[:500]}") from e
    try:
        validated = EvaluationResult.model_validate(data)
    except ValidationError as e:
        raise RuntimeError(f"Evaluator JSON does not match schema: {e}") from e
    aligned = _align_overall_score(validated)
    return aligned.model_dump_json(indent=2)
