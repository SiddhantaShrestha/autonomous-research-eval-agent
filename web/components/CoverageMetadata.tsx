"use client";

import { confidenceFromGrounding } from "@/lib/scoreTier";

type Props = {
  chunksCount: number;
  documentCount: number;
  groundingScore: number;
  sourceFilename: string;
};

export function CoverageMetadata({
  chunksCount,
  documentCount,
  groundingScore,
  sourceFilename,
}: Props) {
  const conf = confidenceFromGrounding(groundingScore);

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-surface-border bg-surface-overlay/40 px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="rounded-md bg-surface-raised px-2.5 py-1 font-medium text-zinc-300 ring-1 ring-surface-border">
          Coverage: <span className="text-zinc-100">{chunksCount}</span> chunk
          {chunksCount === 1 ? "" : "s"}
        </span>
        <span className="rounded-md bg-surface-raised px-2.5 py-1 font-medium text-zinc-300 ring-1 ring-surface-border">
          Sources: <span className="text-zinc-100">{documentCount}</span> document
          {documentCount === 1 ? "" : "s"}
        </span>
        <span className="rounded-md bg-surface-raised px-2.5 py-1 font-medium text-zinc-300 ring-1 ring-surface-border">
          Verification confidence: <span className="text-zinc-100">{conf}</span>
        </span>
      </div>
      <p className="truncate text-xs text-muted-dim sm:max-w-[45%] sm:text-right" title={sourceFilename}>
        File: <span className="text-muted">{sourceFilename}</span>
      </p>
    </div>
  );
}
