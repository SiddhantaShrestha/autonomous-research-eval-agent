"""
OpenClaw-oriented entrypoint: same pipeline as ``main.py`` (including grounding audit),
with OpenClaw agent labels in the log.
"""

from __future__ import annotations

import argparse
import logging
import sys
from pathlib import Path

from rich.console import Console
from rich.traceback import install as rich_traceback_install

_SRC = Path(__file__).resolve().parent
if str(_SRC) not in sys.path:
    sys.path.insert(0, str(_SRC))

from agents.grounding_agent import audit_grounding  # noqa: F401
from pipeline import run_research_pipeline  # noqa: E402

rich_traceback_install(show_locals=False)

logging.basicConfig(level=logging.WARNING, format="%(levelname)s %(name)s: %(message)s")

console = Console()


def main() -> int:
    parser = argparse.ArgumentParser(
        description="OpenClaw wrapper: full pipeline including grounding audit (same outputs as main.py)."
    )
    src = parser.add_mutually_exclusive_group()
    src.add_argument(
        "--file",
        type=Path,
        dest="retrieval_file",
        metavar="PATH",
        help="Use only this document (.txt, .md, .pdf).",
    )
    src.add_argument(
        "--data-dir",
        type=Path,
        metavar="DIR",
        dest="retrieval_data_dir",
        help="Load all supported files from this directory (recursive).",
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

    retrieval_file: Path | None = None
    retrieval_data_dir: Path | None = None
    if args.retrieval_file is not None:
        retrieval_file = args.retrieval_file.expanduser().resolve()
        if not retrieval_file.is_file():
            console.print(f"[red]Error:[/red] --file not found or not a file: {retrieval_file}")
            return 1
    if args.retrieval_data_dir is not None:
        retrieval_data_dir = args.retrieval_data_dir.expanduser().resolve()
        if not retrieval_data_dir.is_dir():
            console.print(f"[red]Error:[/red] --data-dir not found or not a directory: {retrieval_data_dir}")
            return 1

    console.print("[bold]OpenClaw — research evaluation pipeline[/bold]\n")
    return run_research_pipeline(
        query,
        console,
        openclaw_branding=True,
        retrieval_file=retrieval_file,
        retrieval_data_dir=retrieval_data_dir,
    )


if __name__ == "__main__":
    raise SystemExit(main())
