"use client";
import { motion, AnimatePresence } from "motion/react";
import Image from "next/image";
import type { PaintingImage } from "@/lib/types/painting";
import { useState } from "react";
import { getPaintingImageUrl } from "@/lib/utils/imageUrl";
import Lightbox from "./Lightbox";

export default function ImageViewer({
  images,
  title,
  widthCm,
  heightCm
}: {
  images: PaintingImage[];
  title: string;
  widthCm: number;
  heightCm: number;
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

  const rawRatio = widthCm / heightCm;
  const ratio = Math.min(Math.max(rawRatio, 0.6), 1.8)

  if (!active) {
    return (
      <div className="aspect-[4/5] w-full bg-canvas-muted flex items-center justify-center text-ink-muted">
        No image
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-3">
      {sorted.length > 1 && (
        <div className="flex md:flex-col gap-2 order-2 md:order-1">
          {sorted.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(i)}
              className={`relative w-16 md:w-20 aspect-[4/5] overflow-hidden border shrink-0 ${
                i === activeIndex
                  ? "border-ink"
                  : "border-transparent opacity-70"
              }`}
            >
              <Image
                src={getPaintingImageUrl(img.storagePath)}
                alt={img.altText || title}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}

      <button
        onClick={() => setLightboxOpen(true)}
        style={{aspectRatio: ratio}}
        className="order-1 md:order-2 flex-1 aspect-[4/5] bg-canvas-muted relative overflow-hidden block cursor-zoom-in"
        aria-label="Open full size image"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0"
          >
            <Image
              src={getPaintingImageUrl(active.storagePath)}
              alt={active.altText || title}
              fill
              sizes="(max-width: 768px) 100vw, 60vw"
              className="object-cover"
              priority
            />
          </motion.div>
        </AnimatePresence>
      </button>

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
