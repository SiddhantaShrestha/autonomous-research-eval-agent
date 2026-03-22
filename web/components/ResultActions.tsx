"use client";

import { useState } from "react";
import type { PipelineResponse } from "@/lib/types";

function IconCopy({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}

function IconDownload({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
    </svg>
  );
}

function IconRefresh({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  );
}

function IconSparkles({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  );
}

type Props = {
  result: PipelineResponse;
  summaryText: string;
  onRunAnotherQuery: () => void;
};

export function ResultActions({ result, summaryText, onRunAnotherQuery }: Props) {
  const [improveHint, setImproveHint] = useState(false);

  const downloadJson = () => {
    const blob = new Blob([JSON.stringify(result, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `evaluation-${result.source_filename.replace(/\W+/g, "_")}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const copySummary = async () => {
    try {
      await navigator.clipboard.writeText(summaryText);
    } catch {
      /* ignore */
    }
  };

  const btnBase =
    "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-xs font-medium transition";

  return (
    <div className="mt-8 border-t border-surface-border pt-6">
      <div className="flex flex-wrap items-stretch gap-2 sm:items-center">
        <button
          type="button"
          onClick={() => void copySummary()}
          className={`${btnBase} bg-surface-overlay text-zinc-200 ring-1 ring-surface-border hover:bg-surface-raised hover:text-white`}
        >
          <IconCopy className="h-4 w-4 text-muted" />
          Copy summary
        </button>
        <button
          type="button"
          onClick={downloadJson}
          className={`${btnBase} bg-surface-overlay text-zinc-200 ring-1 ring-surface-border hover:bg-surface-raised hover:text-white`}
        >
          <IconDownload className="h-4 w-4 text-muted" />
          Download JSON
        </button>
        <button
          type="button"
          onClick={onRunAnotherQuery}
          className={`${btnBase} bg-surface-overlay text-zinc-200 ring-1 ring-surface-border hover:bg-surface-raised hover:text-white`}
        >
          <IconRefresh className="h-4 w-4 text-muted" />
          Run another query
        </button>
        <button
          type="button"
          onClick={() => {
            // TODO: Wire to refinement / second-pass pipeline when backend exists.
            setImproveHint(true);
          }}
          className={`${btnBase} border border-surface-border bg-transparent text-muted hover:border-zinc-600 hover:text-zinc-200`}
        >
          <IconSparkles className="h-4 w-4 opacity-80" />
          Improve output
        </button>
      </div>
      {improveHint && (
        <p className="mt-3 text-xs text-muted-dim" role="status">
          Refinement is not connected yet — this action is reserved for a future improve pass.
        </p>
      )}
      <p className="mt-4 max-w-2xl text-xs leading-relaxed text-muted-dim">
        Same uploaded file stays selected until you remove or replace it — you can reuse it for multiple
        queries.
      </p>
    </div>
  );
}
