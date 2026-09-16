// components/admin/ImageManager.tsx
"use client";
import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import type { Painting } from "@/lib/types/painting";
import { getPaintingImageUrl } from "@/lib/utils/imageUrl";
import {
  uploadPaintingImages,
  deletePaintingImage,
  setPrimaryImage,
  moveImage,
  updateImageAltText,
} from "@/lib/actions/paintings";

export default function ImageManager({ painting }: { painting: Painting }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const sortedImages = [...painting.images].sort((a, b) => a.sortOrder - b.sortOrder);

  function handleFilesSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const formData = new FormData();
    Array.from(files).forEach((file) => formData.append("files", file));

    startTransition(async () => {
      try {
        await uploadPaintingImages(painting.id, painting.slug, formData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      }
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  }

  return (
    <div>
      {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

      <div className="grid grid-cols-3 gap-6 mb-6">
        {sortedImages.map((img, i) => (
          <div key={img.id} className="space-y-2">
            <div className="relative aspect-[4/5] bg-canvas-muted">
              <Image
                src={getPaintingImageUrl(img.storagePath)}
                alt={img.altText || painting.title}
                fill
                sizes="200px"
                className="object-cover"
              />
              {img.isPrimary && (
                <span className="absolute top-2 left-2 bg-ink text-canvas text-xs px-2 py-1">
                  Primary
                </span>
              )}
            </div>

            <input
              type="text"
              defaultValue={img.altText}
              placeholder="Alt text"
              onBlur={(e) => startTransition(() => updateImageAltText(img.id, painting.id, e.target.value))}
              className="w-full border border-canvas-border px-2 py-1 text-xs"
            />

            <div className="flex items-center gap-3 text-xs">
              <button
                onClick={() => startTransition(() => moveImage(painting.id, img.id, "up"))}
                disabled={i === 0}
                className="disabled:opacity-30"
              >
                ↑
              </button>
              <button
                onClick={() => startTransition(() => moveImage(painting.id, img.id, "down"))}
                disabled={i === sortedImages.length - 1}
                className="disabled:opacity-30"
              >
                ↓
              </button>
              {!img.isPrimary && (
                <button onClick={() => startTransition(() => setPrimaryImage(img.id, painting.id))} className="underline">
                  Set primary
                </button>
              )}
              <button
                onClick={() => startTransition(() => deletePaintingImage(img.id, img.storagePath, painting.id))}
                className="text-red-600 underline"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFilesSelected} disabled={isPending} />
      {isPending && <p className="text-sm text-ink-muted mt-2">Working…</p>}
    </div>
  );
}