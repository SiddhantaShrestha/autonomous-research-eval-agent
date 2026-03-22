# Research evaluation — Next.js UI

Product-style UI for the Python pipeline. Run from **`web/`** (so the API resolves the repo root as `..`).

## Prerequisites

- Node 18+
- Project venv with dependencies + **`GROQ_API_KEY`** in the repo root **`.env`**
- From repo root: `pip install -r requirements.txt`

## Commands

```bash
cd web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Monorepo path

If you deploy or run the app from another working directory, set:

```env
RESEARCH_AGENT_ROOT=/absolute/path/to/research-eval-agent
```

so `scripts/pipeline_json_stdout.py` and `.venv` resolve correctly.
