"use client";

import { useCallback, useRef, useState } from "react";
import { formatBytes } from "@/lib/formatBytes";

const ACCEPT = ".txt,.md,.pdf";
const MAX_MB = 10;

type Props = {
  file: File | null;
  onFile: (f: File | null) => void;
};

function extIcon(name: string): string {
  const e = name.toLowerCase();
  if (e.endsWith(".pdf")) return "PDF";
  if (e.endsWith(".md")) return "MD";
  return "TXT";
}

export function FileUploadZone({ file, onFile }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [drag, setDrag] = useState(false);

  const pick = useCallback(
    (f: File | null) => {
      if (!f) {
        onFile(null);
        return;
      }
      if (f.size > MAX_MB * 1024 * 1024) {
        alert(`File must be ${MAX_MB} MB or smaller.`);
        return;
      }
      const ok = /\.(txt|md|pdf)$/i.test(f.name);
      if (!ok) {
        alert("Only .txt, .md, and .pdf are supported.");
        return;
      }
      onFile(f);
    },
    [onFile]
  );

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDrag(false);
    const f = e.dataTransfer.files[0];
    if (f) pick(f);
  };

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        className="hidden"
        onChange={(e) => pick(e.target.files?.[0] ?? null)}
      />

      {!file ? (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDrag(true);
          }}
          onDragLeave={() => setDrag(false)}
          onDrop={onDrop}
          className={`flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-10 text-center transition ${
            drag
              ? "border-accent bg-accent/5"
              : "border-surface-border bg-surface-raised/50 hover:border-zinc-500 hover:bg-surface-raised"
          }`}
        >
          <span className="text-sm font-medium text-zinc-200">Drop a file here or browse</span>
          <span className="mt-2 text-xs text-muted">
            .txt, .md, .pdf — max {MAX_MB} MB
          </span>
          <span className="mt-4 rounded-lg bg-surface-overlay px-4 py-2 text-xs font-medium text-zinc-300 ring-1 ring-surface-border">
            Choose file
          </span>
        </button>
      ) : (
        <div className="flex items-center justify-between gap-3 rounded-xl border border-surface-border bg-surface-overlay px-4 py-3 shadow-soft">
          <div className="flex min-w-0 items-center gap-3">
            <span className="shrink-0 rounded-md bg-accent/15 px-2 py-1 font-mono text-[10px] font-semibold uppercase tracking-wide text-accent">
              {extIcon(file.name)}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-zinc-100">{file.name}</p>
              <p className="text-xs text-muted">{formatBytes(file.size)}</p>
            </div>
          </div>
          <div className="flex shrink-0 gap-2">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-300 ring-1 ring-surface-border transition hover:bg-surface-raised hover:text-white"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => {
                onFile(null);
                if (inputRef.current) inputRef.current.value = "";
              }}
              className="rounded-lg px-3 py-1.5 text-xs font-medium text-red-300 ring-1 ring-red-500/30 transition hover:bg-red-500/10"
            >
              Remove
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
