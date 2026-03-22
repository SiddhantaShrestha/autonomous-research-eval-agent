"use client";

type Props = {
  data: unknown;
};

export function RawJsonViewer({ data }: Props) {
  const text = JSON.stringify(data, null, 2);
  return (
    <pre className="pre-scroll max-h-[min(70vh,560px)] overflow-auto rounded-xl border border-surface-border bg-[#07080c] p-4 font-mono text-xs leading-relaxed text-zinc-300">
      {text}
    </pre>
  );
}
