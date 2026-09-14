import Link from "next/link";
import { motion } from "motion/react";
import type { Painting } from "@/lib/types/painting";
import { formatPrice } from "@/lib/utils/formatPrice";
import { fadeUp } from "@/components/motion/variants";
import { getPaintingImageUrl } from "@/lib/utils/imageUrl";
import Image from "next/image";

export default function PaintingCard({ painting }: { painting: Painting }) {
    const isAvailable = painting.status === "available";
    const primaryImage = painting.images.find((i)=> i.isPrimary)?? painting.images[0];
    return (
        <motion.div variants={fadeUp}>
            <Link href={`/paintings/${painting.slug}`} className="group block">
                <div className="aspect-[4/5] w-full bg-neutral-200 overflow-hidden relative">
                    {primaryImage ? (
                        <Image
                            src={getPaintingImageUrl(primaryImage.storagePath)}
                            alt={primaryImage.altText || painting.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            className="object-cover group-hover:scale-[1.02] transition-transform duration-300"
                />
                    ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-neutral-400 text-sm">
                        {painting.title}
                    </div>
                    )}
                    
                    {!isAvailable && (
                        <span className="absolute top-3 left-3 bg-white/90 px-2 py-1 text-xs uppercase tracking-wide">
                            {painting.status}
                        </span>
                    )}
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                    <h3 className="font-serif text-base">{painting.title}</h3>
                    <span className={isAvailable ? "text-sm" : "text-sm text-neutral-400 line-through"}>
                        {formatPrice(painting.priceUsd)}
                    </span>
                </div>
                <p className="text-sm text-neutral-500">{painting.medium}</p>
            </Link>
        </motion.div>
    );
}