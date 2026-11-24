"use client";
import Link from "next/link";
import { motion } from "motion/react";
import type { Painting } from "@/lib/types/painting";
import { formatPrice } from "@/lib/utils/formatPrice";
import { fadeUp } from "@/components/motion/variants";
import { getPaintingImageUrl } from "@/lib/utils/imageUrl";
import Image from "next/image";
import { paintingRatio } from "@/lib/utils/paintingDisplay";

export default function PaintingCard({
  painting,
  priority = false,
}: {
  painting: Painting;
  priority: boolean;
}) {
  const primaryImage =
    painting.images.find((i) => i.isPrimary) ?? painting.images[0];
  const ratio = paintingRatio(painting);

  return (
    <motion.div variants={fadeUp}>
      <Link href={`/paintings/${painting.slug}`} className="group block">
        <div
          style={{ aspectRatio: ratio }}
          className="w-full max-h-[70vh] mx-auto overflow-hidden relative"
        >
          {primaryImage ? (
            <Image
              src={getPaintingImageUrl(primaryImage.storagePath)}
              alt={primaryImage.altText || painting.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              priority={priority}
              className="object-contain group-hover:opacity-90 transition-opacity duration-300"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-neutral-400 text-sm">
              {painting.title}
            </div>
          )}
        </div>
        <div className="mt-3 flex items-baseline justify-between">
          <h3 className="font-serif text-base">{painting.title}</h3>
          {painting.status === "sold" ? (
            <span className="text-sm text-ink-muted">Sold</span>
          ) : (
            <span className="text-sm">
              {formatPrice(painting.priceUsd)}
              {painting.status === "reserved" && (
                <span className="ml-2 text-ink-muted">Reserved</span>
              )}
            </span>
          )}
        </div>
        <p className="text-sm text-ink-muted">{painting.medium}</p>
      </Link>
    </motion.div>
  );
}
