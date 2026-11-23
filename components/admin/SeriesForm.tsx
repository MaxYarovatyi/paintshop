// components/admin/SeriesForm.tsx
"use client";
import { useState } from "react";
import Image from "next/image";
import type { Series, SeriesStatus } from "@/lib/types/series";
import { slugify } from "@/lib/utils/slugify";
import { getPaintingImageUrl } from "@/lib/utils/imageUrl";

const inputClass = "w-full border border-canvas-border bg-transparent px-3 py-2";
const labelClass = "block text-sm text-ink-muted mb-1";

export default function SeriesForm({
  series,
  action,
}: {
  series?: Series;
  action: (formData: FormData) => void;
}) {
  const isEdit = !!series;
  const [title, setTitle] = useState(series?.title ?? "");
  const [slug, setSlug] = useState(series?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [status, setStatus] = useState<SeriesStatus>(series?.status ?? "coming");

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  return (
    <form action={action} className="space-y-6 max-w-xl">
      <div>
        <label className={labelClass}>Title</label>
        <input name="title" value={title} onChange={(e) => handleTitleChange(e.target.value)}
          placeholder="Series I" required className={inputClass} />
      </div>

      <div>
        <label className={labelClass}>
          Slug (URL){isEdit && " — fixed after creation"}
        </label>
        <input name="slug" value={slug} readOnly={isEdit} required
          onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }}
          className={`${inputClass} ${isEdit ? "text-ink-muted" : ""}`} />
      </div>

      <div>
        <label className={labelClass}>Intro (2–4 sentences, in the artist&apos;s words)</label>
        <textarea name="intro" defaultValue={series?.intro ?? ""} rows={5} className={inputClass} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Status</label>
          <select name="status" value={status}
            onChange={(e) => setStatus(e.target.value as SeriesStatus)} className={inputClass}>
            <option value="coming">Coming soon</option>
            <option value="live">Live</option>
            <option value="archive">Archive</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Release date{status === "coming" ? " (required)" : ""}</label>
          <input name="releaseDate" type="date" defaultValue={series?.releaseDate ?? ""}
            required={status === "coming"} className={inputClass} />
        </div>
      </div>
      <p className="text-xs text-ink-muted -mt-3">
        Works in a Coming soon series stay hidden from the public site until it is set to Live.
      </p>

      <div>
        <label className={labelClass}>Cover detail image</label>
        {series?.coverImagePath && (
          <div className="relative w-40 aspect-[4/5] mb-3 bg-canvas-muted">
            <Image src={getPaintingImageUrl(series.coverImagePath)}
              alt={series.coverImageAlt || series.title} fill sizes="160px" className="object-cover" />
          </div>
        )}
        <input name="cover" type="file" accept="image/*" />
      </div>

      <div>
        <label className={labelClass}>Cover alt text</label>
        <input name="coverImageAlt" defaultValue={series?.coverImageAlt ?? ""} className={inputClass} />
      </div>

      <button type="submit" className="bg-ink text-canvas px-6 py-3 text-sm uppercase tracking-wide">
        {isEdit ? "Save changes" : "Create series"}
      </button>
    </form>
  );
}