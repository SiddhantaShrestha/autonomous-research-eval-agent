"use client";

import { formatExecutiveSummary } from "@/lib/formatExecutive";
import { MissingInfoTags } from "./MissingInfoTags";

type Props = {
  content: string;
  missingTags?: string[];
};

export function ExecutiveSummaryCard({ content, missingTags = [] }: Props) {
  if (!content.trim()) {
    return (
      <p className="text-sm text-muted">
        No executive summary section was detected. See the full report in other tabs or Raw JSON.
      </p>
    );
  }

  const { bullets, remainder } = formatExecutiveSummary(content);
  const hasBullets = bullets.length >= 2;
  const narrativeText = (hasBullets ? remainder : content.trim()).trim();
  const showNarrative = narrativeText.length > 0;

  return (
    <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06] p-6 shadow-soft ring-1 ring-emerald-500/10">
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-400/80">
        Executive summary
      </p>

      {missingTags.length > 0 && (
        <div className="mt-4">
          <MissingInfoTags tags={missingTags} />
        </div>
      )}

      {hasBullets && (
        <div className="mt-4">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-dim">
            At a glance
          </p>
          <ul className="space-y-2.5 border-l-2 border-emerald-500/25 pl-4">
            {bullets.map((b, i) => (
              <li key={i} className="text-sm leading-relaxed text-zinc-100">
                {b}
              </li>
            ))}
          </ul>
        </div>
      )}

      {showNarrative && (
        <div className={hasBullets ? "mt-6 border-t border-emerald-500/15 pt-6" : "mt-4"}>
          {hasBullets && (
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-muted-dim">
              Full narrative
            </p>
          )}
          <div className="max-w-prose space-y-4 text-sm leading-[1.65] text-zinc-200">
            {narrativeText.split(/\n\n+/).map((para, i) => (
              <p key={i} className="hyphens-auto">
                {para}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
