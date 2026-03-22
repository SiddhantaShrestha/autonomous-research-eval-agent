"use client";

type Props = {
  items: string[];
  emptyHint?: string;
};

export function KeyFindingsList({ items, emptyHint }: Props) {
  if (!items.length) {
    return <p className="text-sm text-muted">{emptyHint ?? "No bullet findings parsed."}</p>;
  }

  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <li
          key={i}
          className="flex gap-3 rounded-lg border border-surface-border bg-surface-overlay/60 px-4 py-3 text-sm leading-relaxed text-zinc-200"
        >
          <span
            className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
            aria-hidden
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
