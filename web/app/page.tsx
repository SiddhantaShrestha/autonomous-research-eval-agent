"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { ResearchInputCard } from "@/components/ResearchInputCard";
import { EmptyResultsState } from "@/components/EmptyResultsState";
import { CoverageMetadata } from "@/components/CoverageMetadata";
import { EvaluationStats } from "@/components/EvaluationStats";
import { InsightBar } from "@/components/InsightBar";
import { ResultsTabs } from "@/components/ResultsTabs";
import { ResultActions } from "@/components/ResultActions";
import { deriveInsight } from "@/lib/deriveInsight";
import type { PipelineResponse } from "@/lib/types";
import { findSection, parseMarkdownSections } from "@/lib/parseReport";

const LOADING_STEPS = [
  "Parsing file…",
  "Generating report…",
  "Checking grounding…",
  "Finalizing…",
];

export default function HomePage() {
  const [query, setQuery] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingStepIdx, setLoadingStepIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PipelineResponse | null>(null);

  useEffect(() => {
    if (!loading) return;
    setLoadingStepIdx(0);
    const t = setInterval(() => {
      setLoadingStepIdx((i) => (i + 1) % LOADING_STEPS.length);
    }, 850);
    return () => clearInterval(t);
  }, [loading]);

  const canSubmit = query.trim().length > 0 && file !== null;

  const run = useCallback(async () => {
    if (!file || !query.trim()) return;
    setError(null);
    setLoading(true);
    try {
      const fd = new FormData();
      fd.set("query", query.trim());
      fd.set("file", file);
      const res = await fetch("/api/evaluate", { method: "POST", body: fd });
      const data = (await res.json()) as PipelineResponse & { error?: string };
      if (!res.ok) {
        throw new Error(data.error || `Request failed (${res.status})`);
      }
      if ("error" in data && data.error) {
        throw new Error(data.error);
      }
      setResult(data as PipelineResponse);
    } catch (e) {
      setResult(null);
      setError(e instanceof Error ? e.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }, [file, query]);

  const summaryForCopy = useMemo(() => {
    if (!result) return "";
    const sections = parseMarkdownSections(result.final_report);
    const exec =
      findSection(sections, "executive summary") ?? result.final_report.slice(0, 2000);
    return exec.trim();
  }, [result]);

  const documentCount = useMemo(() => {
    if (!result) return 1;
    const n = result.unique_sources?.length ?? 0;
    return n > 0 ? n : 1;
  }, [result]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 md:px-6 md:py-14">
      <ResearchInputCard
        query={query}
        onQueryChange={setQuery}
        file={file}
        onFile={setFile}
        loading={loading}
        loadingStep={LOADING_STEPS[loadingStepIdx] ?? "Running evaluation…"}
        canSubmit={canSubmit}
        onSubmit={run}
      />

      <div className="mt-10 space-y-8">
        {error && (
          <div
            role="alert"
            className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
          >
            {error}
          </div>
        )}

        {!result && !loading && !error && <EmptyResultsState />}

        {loading && (
          <section className="rounded-2xl border border-surface-border bg-surface-raised/50 py-20 text-center">
            <div
              className="mx-auto h-10 w-10 animate-spin rounded-full border-2 border-muted border-t-accent"
              aria-hidden
            />
            <p className="mt-4 text-sm font-medium text-zinc-200">Running evaluation…</p>
            <p className="mt-1 text-xs text-muted">{LOADING_STEPS[loadingStepIdx]}</p>
          </section>
        )}

        {result && !loading && (
          <section className="space-y-5">
            <CoverageMetadata
              chunksCount={result.chunks_count}
              documentCount={documentCount}
              groundingScore={result.grounding.grounding_score}
              sourceFilename={result.source_filename}
            />

            <EvaluationStats
              evaluationScore={result.evaluation.score}
              groundingScore={result.grounding.grounding_score}
              revisionSkipped={result.revision_skipped}
              revisionChanged={result.revision_changed}
            />

            <InsightBar text={deriveInsight(result)} />

            <ResultsTabs result={result} />

            <ResultActions
              result={result}
              summaryText={summaryForCopy}
              onRunAnotherQuery={() => {
                setResult(null);
                setError(null);
                setQuery("");
              }}
            />
          </section>
        )}
      </div>
    </main>
  );
}
