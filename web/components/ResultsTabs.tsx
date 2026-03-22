"use client";

import { useMemo, useState } from "react";
import { ExecutiveSummaryCard } from "./ExecutiveSummaryCard";
import { KeyFindingsList } from "./KeyFindingsList";
import { MissingInfoList, gapsToItems } from "./MissingInfoList";
import { NotesRecommendations } from "./NotesRecommendations";
import { RawJsonViewer } from "./RawJsonViewer";
import {
  IconAlert,
  IconCode,
  IconDocument,
  IconLightbulb,
  IconList,
} from "./TabIcons";
import type { PipelineResponse } from "@/lib/types";
import { deriveMissingTags } from "@/lib/missingTags";
import { bodyToBullets, findSection, parseMarkdownSections } from "@/lib/parseReport";

const TABS = [
  { id: "summary", label: "Executive summary", Icon: IconDocument },
  { id: "findings", label: "Key findings", Icon: IconList },
  { id: "missing", label: "Evidence & verification", Icon: IconAlert },
  { id: "notes", label: "Notes / recommendations", Icon: IconLightbulb },
  { id: "json", label: "Raw JSON", Icon: IconCode },
] as const;

type TabId = (typeof TABS)[number]["id"];

type Props = {
  result: PipelineResponse;
};

export function ResultsTabs({ result }: Props) {
  const [tab, setTab] = useState<TabId>("summary");
  const documentCount = result.unique_sources?.length ? result.unique_sources.length : 1;
  const sections = parseMarkdownSections(result.final_report);

  const executive =
    findSection(sections, "executive summary") ??
    result.final_report.slice(0, 1200).trim();

  const findingsBody =
    findSection(sections, "key findings") ?? "";
  const findingsItems = findingsBody ? bodyToBullets(findingsBody) : [];

  const gapsBody =
    findSection(sections, "gaps", "uncertainties") ?? null;

  const conclusionBody =
    findSection(sections, "conclusion") ?? null;

  const missingTags = useMemo(() => {
    const lines = [
      ...result.evaluation.issues,
      ...result.grounding.unsupported_points,
      ...(result.grounding.notes ?? []),
      ...gapsToItems(gapsBody),
    ];
    return deriveMissingTags(lines);
  }, [result, gapsBody]);

  const rawPayload = {
    final_report: result.final_report,
    evaluation: result.evaluation,
    grounding: result.grounding,
    revision_skipped: result.revision_skipped,
    revision_changed: result.revision_changed,
    meta: {
      source_filename: result.source_filename,
      chunks_count: result.chunks_count,
      unique_sources: result.unique_sources,
    },
  };

  return (
    <div className="rounded-2xl border border-surface-border bg-surface-raised/60 shadow-card ring-1 ring-white/[0.04]">
      <div
        role="tablist"
        aria-label="Report sections"
        className="flex flex-wrap gap-1 border-b border-surface-border p-2"
      >
        {TABS.map((t) => {
          const Icon = t.Icon;
          return (
            <button
              key={t.id}
              type="button"
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition sm:text-sm ${
                tab === t.id
                  ? "bg-surface-overlay text-white ring-1 ring-surface-border"
                  : "text-muted hover:bg-surface-overlay/50 hover:text-zinc-200"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0 opacity-80" />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="p-6 md:p-8" role="tabpanel">
        <div className="mx-auto max-w-3xl">
          {tab === "summary" && (
            <ExecutiveSummaryCard content={executive} missingTags={missingTags} />
          )}
          {tab === "findings" && (
            <KeyFindingsList
              items={findingsItems}
              emptyHint="No Key Findings section found; check Supporting Evidence in the source report or try Raw JSON."
            />
          )}
          {tab === "missing" && (
            <MissingInfoList
              evaluationIssues={result.evaluation.issues}
              unsupportedPoints={result.grounding.unsupported_points}
              gapsText={gapsBody}
              chunksCount={result.chunks_count}
              documentCount={documentCount}
              groundingScore={result.grounding.grounding_score}
              groundingNotes={result.grounding.notes}
            />
          )}
          {tab === "notes" && (
            <NotesRecommendations
              suggestedFixes={result.evaluation.suggested_fixes}
              groundingNotes={result.grounding.notes}
              conclusionText={conclusionBody}
            />
          )}
          {tab === "json" && <RawJsonViewer data={rawPayload} />}
        </div>
      </div>
    </div>
  );
}
