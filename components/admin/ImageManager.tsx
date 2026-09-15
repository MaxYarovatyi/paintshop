// components/admin/ImageManager.tsx
"use client";
import Image from "next/image";
import { useRef, useState, useTransition } from "react";
import type { Painting } from "@/lib/types/painting";
import { getPaintingImageUrl } from "@/lib/utils/imageUrl";
import { uploadPaintingImages, deletePaintingImage, setPrimaryImage } from "@/lib/actions/paintings";

export default function ImageManager({ painting }: { painting: Painting }) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

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

      <div className="grid grid-cols-4 gap-4 mb-6">
        {painting.images.map((img) => (
          <div key={img.id} className="space-y-2">
            <div className="relative aspect-[4/5] bg-neutral-200">
              <Image src={getPaintingImageUrl(img.storagePath)} alt={img.altText || painting.title}
                fill sizes="200px" className="object-cover" />
              {img.isPrimary && (
                <span className="absolute top-2 left-2 bg-neutral-900 text-white text-xs px-2 py-1">
                  Primary
                </span>
              )}
            </div>
            <div className="flex gap-2 text-xs">
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
      {isPending && <p className="text-sm text-neutral-500 mt-2">Uploading…</p>}
    </div>
  );
}