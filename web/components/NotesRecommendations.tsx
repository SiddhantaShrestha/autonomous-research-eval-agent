"use client";

type Props = {
  suggestedFixes: string[];
  groundingNotes: string[];
  conclusionText: string | null;
};

export function NotesRecommendations({
  suggestedFixes,
  groundingNotes,
  conclusionText,
}: Props) {
  const has =
    suggestedFixes.length + groundingNotes.length + (conclusionText?.trim() ? 1 : 0);

  if (!has) {
    return <p className="text-sm text-muted">No notes or recommendations in this run.</p>;
  }

  return (
    <div className="space-y-6">
      {suggestedFixes.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">
            Suggested fixes
          </h4>
          <ul className="mt-2 space-y-2">
            {suggestedFixes.map((s, i) => (
              <li key={i} className="text-sm text-zinc-200">
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
      {groundingNotes.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">
            Grounding notes
          </h4>
          <ul className="mt-2 space-y-2">
            {groundingNotes.map((s, i) => (
              <li key={i} className="text-sm text-zinc-200">
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}
      {conclusionText?.trim() && (
        <div className="rounded-lg border border-surface-border bg-surface-overlay/40 p-4">
          <h4 className="text-xs font-semibold uppercase tracking-wide text-muted">Conclusion</h4>
          <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-zinc-200">
            {conclusionText.trim()}
          </p>
        </div>
      )}
    </div>
  );
}
