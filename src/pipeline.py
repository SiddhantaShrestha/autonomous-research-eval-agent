"""
Shared orchestration for the research evaluation pipeline
(retrieval → draft → evaluate → revise → grounding audit).
"""

from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv
from rich.console import Console

from agents.evaluation_agent import evaluate_report
from agents.grounding_agent import audit_grounding
from agents.research_agent import generate_draft_report
from agents.revision_agent import revise_report
from tools.retrieval_tool import ChunkHit, retrieve

PROJECT_ROOT = Path(__file__).resolve().parent.parent
OUTPUTS_DIR = PROJECT_ROOT / "outputs"
DATA_DIR = PROJECT_ROOT / "data"

REVISION_SCORE_THRESHOLD = 8.0


def _write_text(path: Path, text: str) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(text, encoding="utf-8")


def _retrieved_chunks_payload(query: str, chunks: list[ChunkHit]) -> dict:
    return {
        "query": query,
        "chunks": [
            {"filename": h.filename, "chunk": h.chunk, "score": h.score} for h in chunks
        ],
    }


def _run_summary(
    query: str,
    chunks: list[ChunkHit],
    evaluation_json: str,
    draft: str,
    final_md: str,
    *,
    revision_skipped: bool,
    grounding_score: int | None = None,
) -> dict:
    ev = json.loads(evaluation_json)
    out: dict = {
        "query": query,
        "retrieved_chunk_count": len(chunks),
        "unique_retrieved_files": sorted({h.filename for h in chunks}),
        "evaluation_score": ev["score"],
        "revision_skipped": revision_skipped,
        "revision_applied": (not revision_skipped)
        and (draft.strip() != final_md.strip()),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
    if grounding_score is not None:
        out["grounding_score"] = grounding_score
    return out


def run_research_pipeline(
    query: str,
    console: Console,
    *,
    openclaw_branding: bool = False,
    retrieval_file: Path | None = None,
    retrieval_data_dir: Path | None = None,
) -> int:
    """
    Run retrieval, draft, evaluation, conditional revision, grounding audit, and save outputs.

    Retrieval source: ``retrieval_file`` (single document), ``retrieval_data_dir`` (directory
    scan), or default ``data/`` when both are None.

    ``openclaw_branding`` adds OpenClaw agent labels before research, evaluation,
    revision, and grounding (retrieval unchanged).
    """
    load_dotenv(PROJECT_ROOT / ".env")

    path_chunks = OUTPUTS_DIR / "00_retrieved_chunks.json"
    path_draft = OUTPUTS_DIR / "01_draft_report.md"
    path_eval = OUTPUTS_DIR / "02_evaluation.json"
    path_final = OUTPUTS_DIR / "03_final_report.md"
    path_grounding = OUTPUTS_DIR / "05_grounding_audit.json"
    path_summary = OUTPUTS_DIR / "04_run_summary.json"

    try:
        console.print("[1/5] Retrieving evidence...")
        if retrieval_file is not None:
            chunks = retrieve(query, single_file=retrieval_file, top_k=5)
            source_desc = str(retrieval_file)
        elif retrieval_data_dir is not None:
            chunks = retrieve(query, data_dir=retrieval_data_dir, top_k=5)
            source_desc = str(retrieval_data_dir)
        else:
            chunks = retrieve(query, top_k=5)
            source_desc = str(DATA_DIR)
        _write_text(path_chunks, json.dumps(_retrieved_chunks_payload(query, chunks), indent=2))
        console.print(f"  [green]Saved[/green] {path_chunks} ({len(chunks)} chunk(s) from [cyan]{source_desc}[/cyan])")
        if not chunks:
            console.print(
                "  [yellow]Warning:[/yellow] No retrievable chunks (empty corpus, unsupported type, or no overlap)."
            )

        if openclaw_branding:
            console.print("[bold cyan]OpenClaw Research Agent[/bold cyan]")
        console.print("[2/5] Generating draft report...")
        draft = generate_draft_report(query, chunks)
        _write_text(path_draft, draft)
        console.print(f"  [green]Saved[/green] {path_draft}")

        if openclaw_branding:
            console.print("[bold cyan]OpenClaw Evaluation Agent[/bold cyan]")
        console.print("[3/5] Evaluating report quality...")
        evaluation_json = evaluate_report(query, draft)
        _write_text(path_eval, evaluation_json)
        console.print(f"  [green]Saved[/green] {path_eval}")

        score = float(json.loads(evaluation_json)["score"])
        if openclaw_branding:
            console.print("[bold cyan]OpenClaw Revision Agent[/bold cyan]")
        console.print("[4/5] Finalizing report...")
        if score >= REVISION_SCORE_THRESHOLD:
            final_md = draft
            console.print(
                f"  [cyan]Revision skipped[/cyan] (evaluation score {score} >= "
                f"{REVISION_SCORE_THRESHOLD} — [bold]03_final_report.md[/bold] copied from draft)."
            )
            revision_skipped = True
        else:
            final_md = revise_report(query, draft, evaluation_json)
            revision_skipped = False
            if draft.strip() != final_md.strip():
                console.print(
                    f"  [cyan]Revision applied[/cyan] (score {score} < "
                    f"{REVISION_SCORE_THRESHOLD}; reviser changed the draft)."
                )
            else:
                console.print(
                    f"  [cyan]Revision step ran[/cyan] (score {score} < "
                    f"{REVISION_SCORE_THRESHOLD}; reviser output unchanged vs draft)."
                )
        _write_text(path_final, final_md)
        console.print(f"  [green]Saved[/green] {path_final}")

        if openclaw_branding:
            console.print("[bold cyan]OpenClaw Grounding Agent[/bold cyan]")
        console.print("[5/5] Running grounding audit...")
        grounding_result = audit_grounding(query, final_md, chunks)
        _write_text(path_grounding, grounding_result.model_dump_json(indent=2))
        console.print(
            f"  [green]Saved[/green] {path_grounding} "
            f"(grounding_score={grounding_result.grounding_score})"
        )

        summary = _run_summary(
            query,
            chunks,
            evaluation_json,
            draft,
            final_md,
            revision_skipped=revision_skipped,
            grounding_score=grounding_result.grounding_score,
        )
        _write_text(path_summary, json.dumps(summary, indent=2))
        console.print(f"  [green]Saved[/green] {path_summary}")
    except RuntimeError as e:
        console.print(f"[red]Error:[/red] {e}")
        return 1
    except OSError as e:
        console.print(f"[red]File error:[/red] {e}")
        return 1

    console.print("[bold green]Done.[/bold green]")
    return 0
