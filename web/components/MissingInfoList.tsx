"use client";

import { COPY, claimVerificationLine, descriptiveVsAnalyticalLine } from "@/lib/evaluationCopy";
import { deriveMissingTags } from "@/lib/missingTags";
import {
  partitionGroundingNotes,
  partitionUnsupportedPoints,
} from "@/lib/groundingSplit";
import { MissingInfoTags } from "./MissingInfoTags";

type BlockProps = {
  title: string;
  subtitle?: string;
  items: string[];
  variant: "issue" | "unsupported" | "gap" | "limited";
};

function Block({ title, subtitle, items, variant }: BlockProps) {
  if (!items.length) return null;
  const ring =
    variant === "unsupported"
      ? "border-amber-500/20 ring-amber-500/10"
      : variant === "gap"
        ? "border-zinc-500/20 ring-zinc-500/10"
        : variant === "limited"
          ? "border-sky-500/20 ring-sky-500/10"
          : "border-red-500/20 ring-red-500/10";

  return (
    <div className={`rounded-xl border bg-surface-overlay/50 p-4 ring-1 ${ring}`}>
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">{title}</h4>
      {subtitle ? (
        <p className="mt-1 text-[11px] leading-relaxed text-muted-dim">{subtitle}</p>
      ) : null}
      <ul className="mt-3 space-y-2">
        {items.map((t, i) => (
          <li key={i} className="flex gap-2 text-sm leading-relaxed text-zinc-200">
            <span className="text-muted" aria-hidden>
              ·
            </span>
            {t}
          </li>
        ))}
      </ul>
    </div>
  );
}

function EvidenceLimitationsSection({
  documentCount,
  chunksCount,
}: {
  documentCount: number;
  chunksCount: number;
}) {
  return (
    <div className="rounded-xl border border-zinc-500/20 bg-surface-overlay/30 p-4 ring-1 ring-zinc-500/10">
      <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">{COPY.evidenceLimitationsTitle}</h4>
      <ul className="mt-3 list-none space-y-2 text-sm leading-relaxed text-zinc-200/95">
        <li className="flex gap-2">
          <span className="text-muted" aria-hidden>
            ·
          </span>
          <span>
            <span className="text-muted-dim">Source documents:</span> {documentCount}
          </span>
        </li>
        <li className="flex gap-2">
          <span className="text-muted" aria-hidden>
            ·
          </span>
          <span>
            <span className="text-muted-dim">Retrieved chunks used:</span> {chunksCount}
          </span>
        </li>
        <li className="flex gap-2">
          <span className="text-muted" aria-hidden>
            ·
          </span>
          {descriptiveVsAnalyticalLine()}
        </li>
        <li className="flex gap-2">
          <span className="text-muted" aria-hidden>
            ·
          </span>
          {claimVerificationLine(chunksCount)}
        </li>
      </ul>
    </div>
  );
}

type Props = {
  evaluationIssues: string[];
  unsupportedPoints: string[];
  gapsText: string | null;
  chunksCount: number;
  documentCount: number;
  groundingScore: number;
  groundingNotes: string[];
};

export function gapsToItems(gapsText: string | null): string[] {
  if (!gapsText?.trim()) return [];
  return gapsText
    .split(/\n/)
    .map((l) => l.replace(/^[-*•]\s*/, "").trim())
    .filter(Boolean);
}

export function MissingInfoList({
  evaluationIssues,
  unsupportedPoints,
  gapsText,
  chunksCount,
  documentCount,
  groundingScore,
  groundingNotes,
}: Props) {
  const gaps = gapsToItems(gapsText);
  const { unsupportedClaims, notVerifiableLimitedEvidence: fromPoints } =
    partitionUnsupportedPoints(unsupportedPoints);
  const { limiting: limitingNotes, other: otherNotes } = partitionGroundingNotes(groundingNotes);

  const notVerifiableItems = [
    ...fromPoints,
    ...limitingNotes,
  ];
  const weakEvidence = groundingScore < 6;

  const tagLines = [...evaluationIssues, ...unsupportedPoints, ...gaps, ...groundingNotes];
  const missingTags = deriveMissingTags(tagLines);

  return (
    <div className="space-y-4">
      <EvidenceLimitationsSection documentCount={documentCount} chunksCount={chunksCount} />

      {missingTags.length > 0 && <MissingInfoTags tags={missingTags} />}

      {/* Unsupported claims */}
      <div className="rounded-xl border border-amber-500/20 bg-surface-overlay/50 p-4 ring-1 ring-amber-500/10">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">Unsupported claims</h4>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-dim">
          Statements that appear contradicted by the source or not adequately supported by the retrieved
          passages.
        </p>
        {unsupportedClaims.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {unsupportedClaims.map((t, i) => (
              <li key={i} className="flex gap-2 text-sm leading-relaxed text-zinc-200">
                <span className="text-muted" aria-hidden>
                  ·
                </span>
                {t}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-sm leading-relaxed text-zinc-200/95">{COPY.unsupportedEmpty}</p>
        )}
      </div>

      {/* Not verifiable due to limited evidence */}
      <div className="rounded-xl border border-sky-500/20 bg-surface-overlay/50 p-4 ring-1 ring-sky-500/10">
        <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">
          Not verifiable due to limited evidence
        </h4>
        <p className="mt-1 text-[11px] leading-relaxed text-muted-dim">
          Items where the available material makes it difficult to confirm or rule out a claim—distinct from a
          clear mismatch with the source.
        </p>
        {weakEvidence && (
          <p className="mt-3 text-sm leading-relaxed text-zinc-200/95">
            {COPY.insufficientEvidenceWeakGrounding}
          </p>
        )}
        {notVerifiableItems.length > 0 ? (
          <ul className="mt-3 space-y-2">
            {notVerifiableItems.map((t, i) => (
              <li key={i} className="flex gap-2 text-sm leading-relaxed text-zinc-200">
                <span className="text-muted" aria-hidden>
                  ·
                </span>
                {t}
              </li>
            ))}
          </ul>
        ) : (
          !weakEvidence && (
            <p className="mt-3 text-sm leading-relaxed text-zinc-200/95">{COPY.notVerifiableWhenEmpty}</p>
          )
        )}
      </div>

      {otherNotes.length > 0 && (
        <Block
          title="Grounding notes"
          subtitle="Additional context from the evidence review (not necessarily limitations)."
          items={otherNotes}
          variant="gap"
        />
      )}

      <Block
        title="Evaluation notes"
        subtitle="Quality and structure flags from the evaluation pass."
        items={evaluationIssues}
        variant="issue"
      />

      <Block
        title="Gaps & uncertainties (from report)"
        items={gaps}
        variant="gap"
      />
    </div>
  );
}
