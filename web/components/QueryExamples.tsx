"use client";

const EXAMPLES = [
  "Summarize this document",
  "Find unsupported claims",
  "Extract key HR training modules",
  "Evaluate clarity and completeness",
];

type Props = {
  onSelect: (text: string) => void;
};

export function QueryExamples({ onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {EXAMPLES.map((label) => (
        <button
          key={label}
          type="button"
          onClick={() => onSelect(label)}
          className="rounded-full border border-surface-border bg-surface-overlay px-3 py-1.5 text-xs font-medium text-zinc-300 transition hover:border-zinc-500 hover:bg-surface-raised hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50"
        >
          {label}
        </button>
      ))}
    </div>
  );
}
