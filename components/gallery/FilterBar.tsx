import Link from "next/link";

function buildHref(current: {tag?: string; available?: string}, overrides: {tag?: string; available?: string}) {
    const params = new URLSearchParams();
    const merged = {...current, ...overrides};
    if(merged.tag) params.set("tag", merged.tag);
    if(merged.available) params.set("available", merged.available);
    const qs = params.toString();
    return qs? `/gallery?${qs}` : "/gallery";
}

export default function FilterBar({
    tags,
    activeTag,
    availableOnly
}: {
    tags: string[],
    activeTag: string,
    availableOnly: boolean
}) {
    const current = {tag: activeTag, available: availableOnly ? "true" : undefined};

    return (
        <div className="flex flex-wrap items-center gap-x-6 gap-y-3 mb-10 text-sm">
      <div className="flex flex-wrap gap-2">
        <Link
          href={buildHref(current, { tag: undefined })}
          className={!activeTag ? "text-ink" : "text-ink-muted hover:text-ink"}
        >
          All
        </Link>
        {tags.map((tag) => (
          <Link
            key={tag}
            href={buildHref(current, { tag })}
            className={activeTag === tag ? "text-ink" : "text-ink-muted hover:text-ink"}
          >
            #{tag}
          </Link>
        ))}
      </div>

      <Link
        href={buildHref(current, { available: availableOnly ? undefined : "true" })}
        className={`border-l border-canvas-border pl-6 ${availableOnly ? "text-ink" : "text-ink-muted hover:text-ink"}`}
    >
        Available only
      </Link>
    </div>
    )
}