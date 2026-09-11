import Link from "next/link";
import { motion } from "motion/react";
import type { Painting } from "@/lib/types/painting";
import { formatPrice } from "@/lib/utils/formatPrice";
import { fadeUp } from "@/components/motion/variants";

export default function PaintingCard({ painting }: { painting: Painting }) {
    const isAvailable = painting.status === "available";

    return (
        <motion.div variants={fadeUp}>
            <Link href={`/paintings/${painting.slug}`} className="group block">
                <div className="aspect-[4/5] w-full bg-neutral-200 overflow-hidden relative">
                    {/* placeholder block until real images exist — swap for <Image> once painting.images[0] has a real storagePath */}
                    <div className="absolute inset-0 flex items-center justify-center text-neutral-400 text-sm">
                        {painting.title}
                    </div>
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