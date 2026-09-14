"use client";
import {motion, AnimatePresence} from "motion/react";
import Image from "next/image";
import type { PaintingImage } from "@/lib/types/painting";
import { useState } from "react";
import { getPaintingImageUrl } from "@/lib/utils/imageUrl";

export default function ImageViewer({images, title}: {images: PaintingImage[]; title: string})
{
    const sorted = [...images].sort((a,b)=> a.sortOrder-b.sortOrder);
    const [activeIndex, setActiveIndex] = useState(
        Math.max(sorted.findIndex((i)=> i.isPrimary), 0)
    );
    const active = sorted[activeIndex];

    if(!active)
    {
        return (
      <div className="aspect-[4/5] w-full bg-neutral-200 flex items-center justify-center text-neutral-400">
        No image
      </div>
    );
    }
    const primary = images.find((i)=> i.isPrimary)??images[0];

    return (
    <div>
      <div className="aspect-[4/5] w-full bg-neutral-200 relative overflow-hidden">
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
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover"
              priority
            />
          </motion.div>
        </AnimatePresence>
      </div>
      {sorted.length > 1 && (
        <div className="mt-3 flex gap-2">
          {sorted.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(i)}
              className={`relative w-16 aspect-[4/5] overflow-hidden border ${
                i === activeIndex ? "border-neutral-900" : "border-transparent opacity-70"
              }`}
            >
              <Image
                src={getPaintingImageUrl(img.storagePath)}
                alt={img.altText || title}
                fill
                sizes="64px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
    )
}