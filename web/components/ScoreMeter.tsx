"use client";

type Props = {
  value: number;
  max?: number;
  toneClass: string;
};

export function ScoreMeter({ value, max = 10, toneClass }: Props) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-zinc-800/80">
      <div
        className={`h-full rounded-full transition-all ${toneClass}`}
        style={{ width: `${pct}%` }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      />
    </div>
  );
}
