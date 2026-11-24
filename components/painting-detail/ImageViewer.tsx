"use client";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import type { PaintingImage } from "@/lib/types/painting";
import { useState } from "react";
import { getPaintingImageUrl } from "@/lib/utils/imageUrl";
import Lightbox from "./Lightbox";

/**
 * Gallery-style viewer: the whole work sits on a neutral mat with room around it,
 * at its natural proportions. The stage has a fixed height, so the layout does not
 * jump when images of different shapes are selected. Thumbnails are a quiet row below.
 */
export default function ImageViewer({
  images,
  title,
}: {
  images: PaintingImage[];
  title: string;
  widthCm?: number;
  heightCm?: number;
}) {
  const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder);
  const [activeIndex, setActiveIndex] = useState(
    Math.max(
      sorted.findIndex((i) => i.isPrimary),
      0,
    ),
  );
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const active = sorted[activeIndex];

  if (!active) {
    return (
      <div className="h-[55svh] w-full bg-canvas-border/30 flex items-center justify-center text-ink-muted">
        No image
      </div>
    );
  }

  return (
    <div>
      <button
        type="button"
        onClick={() => setLightboxOpen(true)}
        className="relative block w-full h-[58svh] lg:h-[calc(100dvh-10rem)] lg:max-h-[860px] lg:min-h-[480px] cursor-zoom-in overflow-hidden"
        aria-label="Open full size image"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 p-5 md:p-10"
          >
            <div className="relative h-full w-full">
              <Image
                src={getPaintingImageUrl(active.storagePath)}
                alt={active.altText || title}
                fill
                sizes="(max-width: 1024px) 100vw, 70vw"
                className="object-contain"
                priority
              />
            </div>
          </motion.div>
        </AnimatePresence>

        {sorted.length > 1 && (
          <span className="absolute bottom-3 left-4 text-xs tabular-nums text-ink-muted">
            {activeIndex + 1} / {sorted.length}
          </span>
        )}
      </button>

      {sorted.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {sorted.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setActiveIndex(i)}
              aria-label={`Show image ${i + 1}`}
              aria-current={i === activeIndex}
              className={`relative h-16 w-16 md:h-20 md:w-20 shrink-0 border transition-opacity ${
                i === activeIndex
                  ? "border-ink"
                  : "border-transparent opacity-60 hover:opacity-100"
              }`}
            >
              <Image
                src={getPaintingImageUrl(img.storagePath)}
                alt={img.altText || title}
                fill
                sizes="80px"
                className="object-contain p-1"
              />
            </button>
          ))}
        </div>
      )}

      {lightboxOpen && (
        <Lightbox
          images={sorted}
          initialIndex={activeIndex}
          title={title}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
}
