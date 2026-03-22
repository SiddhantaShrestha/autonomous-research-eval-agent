"use client";

import { QueryExamples } from "./QueryExamples";
import { FileUploadZone } from "./FileUploadZone";

type Props = {
  query: string;
  onQueryChange: (q: string) => void;
  file: File | null;
  onFile: (f: File | null) => void;
  loading: boolean;
  loadingStep: string;
  canSubmit: boolean;
  onSubmit: () => void;
};

export function ResearchInputCard({
  query,
  onQueryChange,
  file,
  onFile,
  loading,
  loadingStep,
  canSubmit,
  onSubmit,
}: Props) {
  return (
    <section className="rounded-2xl border border-surface-border bg-surface-raised/80 p-6 shadow-card backdrop-blur-sm md:p-8">
      <div className="mx-auto max-w-3xl space-y-6">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Research evaluation
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            Upload a source document, ask a question, and run the full pipeline: draft, quality
            evaluation, optional revision, and grounding audit — same engine as the CLI.
          </p>
        </header>

        <div className="space-y-2">
          <label htmlFor="query" className="text-xs font-medium uppercase tracking-wide text-muted-dim">
            Research query
          </label>
          <textarea
            id="query"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            rows={4}
            placeholder="What should we extract, summarize, or verify from this document?"
            disabled={loading}
            className="w-full resize-y rounded-xl border border-surface-border bg-surface-overlay px-4 py-3 text-sm text-zinc-100 placeholder:text-muted-dim focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/40 disabled:opacity-50"
          />
          <p className="text-xs text-muted">
            Ask for a summary, critique, extraction, grounding check, or comparison.
          </p>
          <QueryExamples onSelect={onQueryChange} />
        </div>

        <div className="space-y-2">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-dim">
            Source document
          </span>
          <FileUploadZone file={file} onFile={onFile} />
        </div>

        <div className="flex flex-col gap-3 border-t border-surface-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-h-[1.25rem] text-sm text-muted">
            {loading ? (
              <span className="flex items-center gap-2">
                <span
                  className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-muted border-t-accent"
                  aria-hidden
                />
                {loadingStep}
              </span>
            ) : (
              <span>Ready when query and file are set.</span>
            )}
          </div>
          <button
            type="button"
            disabled={!canSubmit || loading}
            onClick={onSubmit}
            className="inline-flex items-center justify-center rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-500/20 transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:bg-zinc-600 disabled:shadow-none"
          >
            {loading ? "Running…" : "Run evaluation"}
          </button>
        </div>
      </div>
    </section>
  );
}
