"""
Pydantic schema for structured grounding audits (claims vs. evidence).

Use this when an LLM or pipeline step must report which statements are supported
by provided sources and which are not.
"""

from __future__ import annotations

from pydantic import BaseModel, Field


class GroundingAuditResult(BaseModel):
    """
    Result of auditing how well a text is grounded in supplied evidence.

    ``grounding_score`` summarizes overall alignment on a 1–10 scale.
    ``supported_points`` and ``unsupported_points`` list concise claim-level findings.
    ``notes`` holds caveats, missing evidence, or methodology remarks.
    """

    grounding_score: int = Field(
        ge=1,
        le=10,
        description="Overall grounding quality from 1 (poor) to 10 (strong).",
    )
    supported_points: list[str] = Field(
        description="Claims or sentences that appear supported by the evidence.",
    )
    unsupported_points: list[str] = Field(
        description="Claims or sentences that lack support or contradict the evidence.",
    )
    notes: list[str] = Field(
        description="Observations such as ambiguous wording, thin evidence, or methodology.",
    )


if __name__ == "__main__":
    sample = GroundingAuditResult(
        grounding_score=7,
        supported_points=[
            "EV adoption is linked to fuel costs in the provided text.",
        ],
        unsupported_points=[
            "National market share figures (not in sources).",
        ],
        notes=["Evidence limited to one document."],
    )
    print(sample.model_dump_json(indent=2))
