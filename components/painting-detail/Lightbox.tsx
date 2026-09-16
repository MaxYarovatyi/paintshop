"use client";
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "motion/react";
import type { PaintingImage } from "@/lib/types/painting";
import { getPaintingImageUrl } from "@/lib/utils/imageUrl";

export default function Lightbox({
  images,
  initialIndex,
  title,
  onClose,
}: {
  images: PaintingImage[];
  initialIndex: number;
  title: string;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(initialIndex);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  function handleTouchStart(e: React.TouchEvent)
  {
    setTouchStartX(e.touches[0].clientX);
  }
  function handleTouchEnd(e: React.TouchEvent)
  {
    if(touchStartX === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX;
    const threshold = 50;
    if(deltaX > threshold) goPrev();
    else if(deltaX < -threshold) goNext();
    setTouchStartX(null);
  }

  const goNext = useCallback(
    () => setIndex((i) => (i + 1) % images.length),
    [images.length],
  );
  const goPrev = useCallback(
    () => setIndex((i) => (i - 1 + images.length) % images.length),
    [images.length],
  );

  useEffect(() => {
    document.body.style.overflow = "hidden";
    function handleKey(e: globalThis.KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    }
    window.addEventListener("keydown", handleKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleKey);
    };
  }, [onClose, goNext, goPrev]);

  const active = images[index];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 bg-ink/95 flex items-center justify-center"
      onClick={onClose}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <button
        onClick={onClose}
        aria-label="Close"
        className="absolute top-6 right-6 text-canvas text-sm uppercase tracking-wide"
      >
        Close
      </button>

      {images.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goPrev();
            }}
            aria-label="Previous image"
            className="absolute left-4 md:left-8 text-canvas text-2xl px-3 py-2"
          >
            ‹
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              goNext();
            }}
            aria-label="Next image"
            className="absolute right-4 md:right-8 text-canvas text-2xl px-3 py-2"
          >
            ›
          </button>
        </>
      )}

      <AnimatePresence mode="wait">
        <motion.div
          key={active.id}
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-[90vw] h-[85vh] max-w-5xl"
        >
          <Image
            src={getPaintingImageUrl(active.storagePath)}
            alt={active.altText || title}
            fill
            sizes="90vw"
            className="object-contain"
          />
        </motion.div>
      </AnimatePresence>

      {images.length > 1 && (
        <div className="absolute bottom-6 text-canvas text-sm">
          {index + 1} / {images.length}
        </div>
      )}
    </motion.div>
  );
}
