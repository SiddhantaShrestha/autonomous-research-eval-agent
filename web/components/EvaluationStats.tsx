"use client";

import { ScoreMeter } from "./ScoreMeter";
import {
  evaluationHelper,
  evaluationTone,
  groundingHelper,
  groundingTone,
  revisionHelper,
  toneClasses,
} from "@/lib/scoreLabels";
import { scoreStrengthTier } from "@/lib/scoreTier";

function meterFillClass(tier: "Strong" | "Moderate" | "Weak"): string {
  switch (tier) {
    case "Strong":
      return "bg-emerald-500/75";
    case "Moderate":
      return "bg-amber-500/70";
    default:
      return "bg-red-500/55";
  }
}

type Props = {
  evaluationScore: number;
  groundingScore: number;
  revisionSkipped: boolean;
  revisionChanged?: boolean;
};

export function EvaluationStats({
  evaluationScore,
  groundingScore,
  revisionSkipped,
  revisionChanged,
}: Props) {
  const evTone = toneClasses(evaluationTone(evaluationScore));
  const grTone = toneClasses(groundingTone(groundingScore));
  const evTier = scoreStrengthTier(evaluationScore);
  const grTier = scoreStrengthTier(groundingScore);

  const revLabel = revisionSkipped ? "Skipped" : "Applied";
  const revSub = revisionHelper(revisionSkipped, revisionChanged);

  const revTone =
    revisionSkipped || revisionChanged === false
      ? toneClasses("good")
      : toneClasses("mid");

  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <article
        className={`flex flex-col rounded-xl border bg-surface-overlay p-5 shadow-soft ${evTone.border}`}
      >
        <div className="flex items-start justify-between gap-2">
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Evaluation score</p>
          <span className="rounded-md bg-zinc-800/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-300">
            {evTier}
          </span>
        </div>
        <p className={`mt-2 text-3xl font-semibold tabular-nums ${evTone.text}`}>
          {evaluationScore.toFixed(1)}
          <span className="text-lg font-normal text-muted">/10</span>
        </p>
        <ScoreMeter value={evaluationScore} toneClass={meterFillClass(evTier)} />
        <p className="mt-3 text-xs leading-relaxed text-muted">{evaluationHelper(evaluationScore)}</p>
      </article>

      <article
        className={`flex flex-col rounded-xl border bg-surface-overlay p-5 shadow-soft ${grTone.border}`}
      >
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-muted">Grounding score</p>
            <p className="mt-0.5 text-[10px] font-normal normal-case tracking-normal text-muted-dim">
              Evidence support for claims vs. retrieved passages
            </p>
          </div>
          <span className="shrink-0 rounded-md bg-zinc-800/80 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-zinc-300">
            {grTier}
          </span>
        </div>
        <p className={`mt-2 text-3xl font-semibold tabular-nums ${grTone.text}`}>
          {groundingScore}
          <span className="text-lg font-normal text-muted">/10</span>
        </p>
        <ScoreMeter value={groundingScore} toneClass={meterFillClass(grTier)} />
        <p className="mt-3 text-xs leading-relaxed text-muted">{groundingHelper(groundingScore)}</p>
      </article>

      <article
        className={`flex flex-col rounded-xl border bg-surface-overlay p-5 shadow-soft ${revTone.border}`}
      >
        <p className="text-xs font-medium uppercase tracking-wide text-muted">Revision status</p>
        <p className={`mt-2 text-2xl font-semibold ${revTone.text}`}>{revLabel}</p>
        <p className="mt-3 text-xs leading-relaxed text-muted">{revSub}</p>
      </article>
    </div>
  );
}
