"use client";

export function EmptyResultsState() {
  return (
    <section
      className="rounded-2xl border border-dashed border-surface-border bg-surface-raised/40 py-16 text-center shadow-soft"
      aria-live="polite"
    >
      <div className="mx-auto flex max-w-md flex-col items-center px-6">
        <div
          className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-surface-overlay ring-1 ring-surface-border"
          aria-hidden
        >
          <svg
            className="h-7 w-7 text-muted"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m6.75 12l-3-3m0 0l-3 3m3-3v11.25m-9-3h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 002.25 2.25M16.5 10.5V18a2.25 2.25 0 002.25 2.25M16.5 10.5V8.25c0-.621-.504-1.125-1.125-1.125H13.5"
            />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-zinc-100">No evaluation yet</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted">
          Upload a document and enter a query to generate a structured report, scores, and
          trust-focused findings.
        </p>
      </div>
    </section>
  );
}
