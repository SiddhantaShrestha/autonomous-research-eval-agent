"""
CLI entrypoint: orchestrate retrieval, draft, evaluation, conditional revision, and outputs.
"""

from __future__ import annotations

import argparse
import json
import sys
from datetime import datetime, timezone
from pathlib import Path

from dotenv import load_dotenv
from rich.console import Console
from rich.traceback import install as rich_traceback_install

# Resolve imports when running as `python src/main.py` (no installed package).
_SRC = Path(__file__).resolve().parent
if str(_SRC) not in sys.path:
    sys.path.insert(0, str(_SRC))

from agents.evaluation_agent import evaluate_report  # noqa: E402
from agents.research_agent import generate_draft_report  # noqa: E402
from agents.revision_agent import revise_report  # noqa: E402
from tools.retrieval_tool import ChunkHit, retrieve  # noqa: E402

rich_traceback_install(show_locals=False)

PROJECT_ROOT = Path(__file__).resolve().parent.parent
OUTPUTS_DIR = PROJECT_ROOT / "outputs"
DATA_DIR = PROJECT_ROOT / "data"

REVISION_SCORE_THRESHOLD = 8.0

console = Console()


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
) -> dict:
    ev = json.loads(evaluation_json)
    return {
        "query": query,
        "retrieved_chunk_count": len(chunks),
        "unique_retrieved_files": sorted({h.filename for h in chunks}),
        "evaluation_score": ev["score"],
        "revision_skipped": revision_skipped,
        "revision_applied": (not revision_skipped)
        and (draft.strip() != final_md.strip()),
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }


def main() -> int:
    parser = argparse.ArgumentParser(
        description="Research evaluation agent: draft, evaluate, revise using Groq."
    )
    parser.add_argument(
        "query",
        nargs="+",
        help="Research question (words combined into one string)",
    )
    args = parser.parse_args()
    query = " ".join(args.query).strip()
    if not query:
        console.print("[red]Error:[/red] Query must not be empty.")
        return 1

    load_dotenv(PROJECT_ROOT / ".env")

    path_chunks = OUTPUTS_DIR / "00_retrieved_chunks.json"
    path_draft = OUTPUTS_DIR / "01_draft_report.md"
    path_eval = OUTPUTS_DIR / "02_evaluation.json"
    path_final = OUTPUTS_DIR / "03_final_report.md"
    path_summary = OUTPUTS_DIR / "04_run_summary.json"

    try:
        console.print("[1/4] Retrieving evidence...")
        chunks = retrieve(query, data_dir=DATA_DIR, top_k=5)
        _write_text(path_chunks, json.dumps(_retrieved_chunks_payload(query, chunks), indent=2))
        console.print(f"  [green]Saved[/green] {path_chunks} ({len(chunks)} chunk(s) from [cyan]{DATA_DIR}[/cyan])")
        if not chunks:
            console.print("  [yellow]Warning:[/yellow] No markdown chunks found; the draft may be limited.")

        console.print("[2/4] Generating draft report...")
        draft = generate_draft_report(query, chunks)
        _write_text(path_draft, draft)
        console.print(f"  [green]Saved[/green] {path_draft}")

        console.print("[3/4] Evaluating report quality...")
        evaluation_json = evaluate_report(query, draft)
        _write_text(path_eval, evaluation_json)
        console.print(f"  [green]Saved[/green] {path_eval}")

        score = float(json.loads(evaluation_json)["score"])
        console.print("[4/4] Finalizing report...")
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

        summary = _run_summary(
            query, chunks, evaluation_json, draft, final_md, revision_skipped=revision_skipped
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


if __name__ == "__main__":
    raise SystemExit(main())
