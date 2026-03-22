from typing import List

from pydantic import BaseModel, Field


class EvaluationResult(BaseModel):
    """Subscores and overall score use a 1–10 scale; ``score`` aligns with subscore average."""

    score: float = Field(ge=1, le=10, description="Overall quality; should match subscore average.")
    relevance: int = Field(ge=1, le=10)
    completeness: int = Field(ge=1, le=10)
    clarity: int = Field(ge=1, le=10)
    evidence_usage: int = Field(ge=1, le=10)
    issues: List[str]
    suggested_fixes: List[str]
