"use client";

type Props = {
  text: string;
};

export function InsightBar({ text }: Props) {
  return (
    <div className="rounded-xl border border-blue-500/20 bg-gradient-to-r from-blue-500/[0.07] to-indigo-500/[0.05] px-4 py-3 shadow-soft ring-1 ring-blue-500/10">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-blue-300/80">
        Insight
      </p>
      <p className="mt-1 text-sm leading-relaxed text-zinc-100">{text}</p>
    </div>
  );
}
