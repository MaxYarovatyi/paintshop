// components/admin/PaintingForm.tsx
"use client";
import { useState } from "react";
import type { Painting } from "@/lib/types/painting";
import { slugify } from "@/lib/utils/slugify";

export default function PaintingForm({
  painting,
  action,
}: {
  painting?: Painting;
  action: (formData: FormData) => void;
}) {
  const [title, setTitle] = useState(painting?.title ?? "");
  const [slug, setSlug] = useState(painting?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(!!painting);

  function handleTitleChange(value: string) {
    setTitle(value);
    if (!slugTouched) setSlug(slugify(value));
  }

  return (
    <form action={action} className="space-y-6 max-w-xl">
      <div>
        <label className="block text-sm text-ink-muted mb-1">Title</label>
        <input name="title" value={title} onChange={(e) => handleTitleChange(e.target.value)} required
          className="w-full border border-neutral-300 px-3 py-2" />
      </div>

      <div>
        <label className="block text-sm text-ink-muted mb-1">Slug (URL)</label>
        <input name="slug" value={slug}
          onChange={(e) => { setSlug(e.target.value); setSlugTouched(true); }} required
          className="w-full border border-neutral-300 px-3 py-2" />
      </div>

      <div>
        <label className="block text-sm text-ink-muted mb-1">Description</label>
        <textarea name="description" defaultValue={painting?.description ?? ""} rows={4}
          className="w-full border border-neutral-300 px-3 py-2" />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-ink-muted mb-1">Price (USD)</label>
          <input name="priceUsd" type="number" step="0.01" defaultValue={painting?.priceUsd ?? ""} required
            className="w-full border border-neutral-300 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm text-ink-muted mb-1">Status</label>
          <select name="status" defaultValue={painting?.status ?? "available"}
            className="w-full border border-neutral-300 px-3 py-2">
            <option value="available">Available</option>
            <option value="reserved">Reserved</option>
            <option value="sold">Sold</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-ink-muted mb-1">Width (cm)</label>
          <input name="widthCm" type="number" step="0.1" defaultValue={painting?.widthCm ?? ""} required
            className="w-full border border-neutral-300 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm text-ink-muted mb-1">Height (cm)</label>
          <input name="heightCm" type="number" step="0.1" defaultValue={painting?.heightCm ?? ""} required
            className="w-full border border-neutral-300 px-3 py-2" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-ink-muted mb-1">Medium</label>
          <input name="medium" defaultValue={painting?.medium ?? ""} placeholder="e.g. Oil on canvas" required
            className="w-full border border-neutral-300 px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm text-ink-muted mb-1">Year</label>
          <input name="yearCreated" type="number" defaultValue={painting?.yearCreated ?? ""}
            className="w-full border border-neutral-300 px-3 py-2" />
        </div>
      </div>

      <div>
        <label className="block text-sm text-ink-muted mb-1">Tags (comma separated)</label>
        <input name="tags" defaultValue={painting?.tags.join(", ") ?? ""} placeholder="abstract, monochrome"
          className="w-full border border-neutral-300 px-3 py-2" />
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input name="isFeatured" type="checkbox" defaultChecked={painting?.isFeatured ?? false} />
        Featured on homepage
      </label>

      <button type="submit" className="bg-neutral-900 text-white px-6 py-3 text-sm uppercase tracking-wide">
        {painting ? "Save changes" : "Create painting"}
      </button>
    </form>
  );
}