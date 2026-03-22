# Autonomous Research and Evaluation Agent

## Overview

This project is a **command-line research pipeline** that turns a natural-language query and a local evidence corpus into a structured markdown report, **critiques** that report with a **structured JSON evaluation**, and optionally **revises** the draft based on that feedback. Retrieval is fully **local** (no vector DB required for the baseline); generation, evaluation, and revision use the **Groq API** (`llama-3.3-70b-versatile`).

The design separates **retrieval**, **research (drafting)**, **evaluation**, and **revision** into explicit stages so each step can be inspected, logged, and extended independently.

## Features

- **Local retrieval** — Reads Markdown files from `data/`, splits them into paragraph chunks, ranks chunks by simple keyword overlap with the query, and returns the top passages for grounding.
- **Research agent** — Produces a structured markdown draft (executive summary, findings, evidence, gaps, conclusion) using only the retrieved chunks.
- **Evaluation agent** — Returns **structured JSON** aligned with a Pydantic schema: overall score plus subscores (relevance, completeness, clarity, evidence usage on a 1–10 scale), issues, and suggested fixes. The overall score is normalized to match the mean of the subscores for internal consistency.
- **Revision agent** — Rewrites the draft using the evaluation JSON when revision runs.
- **Conditional revision** — If the evaluation score is **≥ 8.0** (configurable threshold in code), the revision step is **skipped** and the final report is the draft; otherwise the reviser runs.
- **Traceable outputs** — Each run writes numbered artifacts under `outputs/`, including retrieved chunks, draft, evaluation, final report, and a run summary with timestamps and revision flags.

## Architecture

```
┌─────────────┐     ┌─────────────────┐     ┌──────────────────┐
│   Local     │     │  Research       │     │  Evaluation      │
│  retrieval  │────▶│  agent (Groq)   │────▶│  agent (Groq)    │
│  (data/*.md)│     │  draft MD       │     │  JSON + schema   │
└─────────────┘     └────────┬────────┘     └────────┬─────────┘
                             │                      │
                             │            score < 8?  │
                             │                      ▼
                             │              ┌───────────────┐
                             └──────────────│ Revision      │
                                   (skip)    │ agent (Groq)  │
                                            └───────┬───────┘
                                                    ▼
                                            Final markdown + summary
```

- **`src/main.py`** — Orchestrates the pipeline only: CLI, file I/O, conditional revision, run summary.
- **`src/agents/`** — One module per agent (`research_agent`, `evaluation_agent`, `revision_agent`) plus shared **`groq_client`** (chat completions) and **`prompt_loader`** (optional overrides from `src/prompts/*.txt`).
- **`src/tools/retrieval_tool.py`** — Paragraph-level retrieval and scoring.
- **`src/schemas/evaluation_schema.py`** — Pydantic model for validated evaluation JSON.

## Folder Structure

```
research-eval-agent/
├── data/                    # Markdown sources for retrieval (e.g. *.md)
├── outputs/                 # Run artifacts (see below)
├── src/
│   ├── main.py              # CLI orchestrator
│   ├── agents/
│   │   ├── groq_client.py   # Shared Groq client + chat helper
│   │   ├── prompt_loader.py # Loads src/prompts/{agent}.txt when present
│   │   ├── research_agent.py
│   │   ├── evaluation_agent.py
│   │   └── revision_agent.py
│   ├── prompts/             # Optional prompt overrides (researcher, evaluator, reviser)
│   ├── schemas/
│   │   └── evaluation_schema.py
│   └── tools/
│       └── retrieval_tool.py
├── .env                     # Local secrets (not committed)
├── requirements.txt
└── README.md
```

## Setup

1. **Clone** the repository and open a terminal at the project root.

2. **Create a virtual environment** (recommended):

   ```bash
   python -m venv .venv
   ```

3. **Activate** the environment (examples):

   - Windows (PowerShell): `.venv\Scripts\Activate.ps1`
   - macOS/Linux: `source .venv/bin/activate`

4. **Install dependencies**:

   ```bash
   pip install -r requirements.txt
   ```

5. **Configure environment variables** (see next section).

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | Yes | API key for [Groq](https://console.groq.com/). Used by all LLM agents. |

Create a `.env` file in the project root (same directory as `requirements.txt`):

```env
GROQ_API_KEY=your_key_here
```

The CLI loads `.env` automatically via `python-dotenv`.

## How to Run

From the **project root**, pass the research question as positional arguments (words are joined into one query string):

```bash
python src/main.py What are the main factors in Nepal electric vehicle adoption?
```

The pipeline prints four stages (`[1/4]` … `[4/4]`) and writes files under `outputs/`. If evaluation score is below the revision threshold, you will see whether the reviser changed the draft or left it unchanged.

## Example Output Files

After a successful run, `outputs/` typically contains:

| File | Description |
|------|-------------|
| `00_retrieved_chunks.json` | Query plus ranked chunks (filename, text, retrieval score). |
| `01_draft_report.md` | Markdown draft from the **research agent**. |
| `02_evaluation.json` | **Structured JSON evaluation** (scores, issues, suggested fixes). |
| `03_final_report.md` | Final report: either the revised draft or a copy of the draft if revision was skipped. |
| `04_run_summary.json` | Query, chunk counts, unique source files, evaluation score, revision skipped/applied flags, ISO timestamp. |

Older filenames (`draft_report.md`, `evaluation.json`, etc.) are legacy; the numbered convention is what the current orchestrator writes.

## Why This Is Agentic

- **Role separation** — Distinct agents with dedicated prompts and responsibilities (research vs. critique vs. edit), rather than a single monolithic prompt.
- **Tool-augmented grounding** — A **retrieval** step supplies evidence before generation, reducing unsupported generation relative to a bare LLM call.
- **Structured critique** — The **evaluation agent** emits **machine-readable JSON** (schema-validated), which can drive downstream automation or UI, not only human reading.
- **Closed-loop improvement** — The **revision agent** consumes evaluation feedback to refine the draft when scores indicate room for improvement.
- **Governed autonomy** — **Conditional revision** implements a policy: high-quality drafts skip an extra model call; lower scores trigger deliberate revision.

Together, these properties match a practical notion of **agentic** systems: modular actors, explicit state (artifacts), tools, and policy-controlled loops.

## Future Improvements

- **Better retrieval** — Embeddings, hybrid search, or citation-span extraction for finer-grained evidence.
- **Configurable thresholds and models** — CLI flags or config file for revision cutoff, `top_k`, temperature, and model name.
- **Tests** — Unit tests for retrieval scoring and evaluation JSON validation; integration tests with mocked LLM responses.
- **Observability** — Structured logging, optional export of token usage, and run IDs for comparing experiments.
- **Multi-format corpora** — Ingest PDF or HTML with preprocessing while keeping the same agent contract.

---

*Portfolio note: This README describes the intended behavior of the repository as implemented in `src/`; extend the “Future Improvements” section as you ship features.*
