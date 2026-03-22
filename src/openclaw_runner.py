"""
OpenClaw-oriented entrypoint: same pipeline as ``main.py``, with OpenClaw agent labels in the log.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

from rich.console import Console
from rich.traceback import install as rich_traceback_install

_SRC = Path(__file__).resolve().parent
if str(_SRC) not in sys.path:
    sys.path.insert(0, str(_SRC))

from pipeline import run_research_pipeline  # noqa: E402

rich_traceback_install(show_locals=False)

console = Console()


def main() -> int:
    parser = argparse.ArgumentParser(
        description="OpenClaw wrapper: research evaluation pipeline (same outputs as main.py)."
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

    console.print("[bold]OpenClaw — research evaluation pipeline[/bold]\n")
    return run_research_pipeline(query, console, openclaw_branding=True)


if __name__ == "__main__":
    raise SystemExit(main())
