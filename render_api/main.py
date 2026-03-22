"""
FastAPI server for the research-eval pipeline (Render / any ASGI host).

POST /api/evaluate — multipart form: query (text), file (upload).
Same JSON shape as scripts/pipeline_json_stdout.py stdout.
"""

from __future__ import annotations

import json
import os
import sys
import tempfile
from pathlib import Path

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src"
sys.path.insert(0, str(SRC))

MAX_BYTES = 10 * 1024 * 1024

app = FastAPI(title="Research evaluation API", version="1.0.0")


@app.exception_handler(HTTPException)
async def http_exception_handler(_request, exc: HTTPException) -> JSONResponse:
    """Match Next.js route shape: { \"error\": \"...\" }."""
    d = exc.detail
    if isinstance(d, list):
        msg = "; ".join(str(x) for x in d)
    else:
        msg = str(d)
    return JSONResponse(status_code=exc.status_code, content={"error": msg})


def _cors_origins() -> list[str]:
    raw = os.getenv("ALLOWED_ORIGINS", "").strip()
    if not raw:
        return ["*"]
    return [o.strip() for o in raw.split(",") if o.strip()]


_origins = _cors_origins()
app.add_middleware(
    CORSMiddleware,
    allow_origins=_origins,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.post("/api/evaluate")
async def evaluate(
    query: str = Form(...),
    file: UploadFile = File(...),
) -> dict:
    q = (query or "").strip()
    if not q:
        raise HTTPException(status_code=400, detail="Query is required.")
    if not file.filename:
        raise HTTPException(status_code=400, detail="File is required.")

    body = await file.read()
    if len(body) > MAX_BYTES:
        raise HTTPException(
            status_code=400,
            detail=f"File too large (max {MAX_BYTES // (1024 * 1024)} MB).",
        )

    suffix = Path(file.filename).suffix or ".txt"
    tmp = None
    tmp_path: Path | None = None
    try:
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
        tmp.write(body)
        tmp.flush()
        tmp.close()
        tmp_path = Path(tmp.name)

        from pipeline import run_stages_for_uploaded_file

        try:
            r = run_stages_for_uploaded_file(q, tmp_path)
        except RuntimeError as e:
            raise HTTPException(status_code=400, detail=str(e)) from e
        except OSError as e:
            raise HTTPException(status_code=400, detail=f"File error: {e}") from e

        ev = json.loads(r.evaluation_json)
        out: dict = {
            "final_report": r.final_report,
            "evaluation": ev,
            "grounding": r.grounding.model_dump(),
            "revision_skipped": r.revision_skipped,
            "revision_changed": (not r.revision_skipped)
            and (r.draft.strip() != r.final_report.strip()),
            "source_filename": file.filename or tmp_path.name,
            "chunks_count": len(r.chunks),
            "unique_sources": sorted({c.filename for c in r.chunks}),
        }
        return out
    finally:
        if tmp_path is not None and tmp_path.is_file():
            try:
                tmp_path.unlink()
            except OSError:
                pass


# Render / platforms that expect $PORT
if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", "8000"))
    uvicorn.run("render_api.main:app", host="0.0.0.0", port=port, reload=False)
