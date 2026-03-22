"use client";

type Props = {
  tags: string[];
};

export function MissingInfoTags({ tags }: Props) {
  if (!tags.length) return null;
  return (
    <div className="mb-4">
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-dim">
        Missing information (inferred)
      </p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full border border-amber-500/25 bg-amber-500/10 px-2.5 py-1 text-xs font-medium text-amber-200/90"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
