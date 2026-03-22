"""
Read JSON from stdin: {"query": str, "file": str (absolute path to uploaded doc)}.
Print a single JSON object to stdout for the Next.js API route.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
sys.path.insert(0, str(SRC))


def main() -> None:
    data = json.load(sys.stdin)
    query = data.get("query", "").strip()
    file_path = Path(data.get("file", ""))
    if not query:
        print(json.dumps({"error": "Query must not be empty."}), file=sys.stderr)
        sys.exit(1)
    if not file_path.is_file():
        print(json.dumps({"error": f"File not found: {file_path}"}), file=sys.stderr)
        sys.exit(1)

    from pipeline import run_stages_for_uploaded_file

    try:
        r = run_stages_for_uploaded_file(query, file_path)
    except RuntimeError as e:
        print(json.dumps({"error": str(e)}), file=sys.stderr)
        sys.exit(1)
    except OSError as e:
        print(json.dumps({"error": f"File error: {e}"}), file=sys.stderr)
        sys.exit(1)

    ev = json.loads(r.evaluation_json)
    out = {
        "final_report": r.final_report,
        "evaluation": ev,
        "grounding": r.grounding.model_dump(),
        "revision_skipped": r.revision_skipped,
        "revision_changed": (not r.revision_skipped)
        and (r.draft.strip() != r.final_report.strip()),
        "source_filename": file_path.name,
        "chunks_count": len(r.chunks),
        "unique_sources": sorted({c.filename for c in r.chunks}),
    }
    json.dump(out, sys.stdout)


if __name__ == "__main__":
    main()
