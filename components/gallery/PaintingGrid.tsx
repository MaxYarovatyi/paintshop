"use client";
import { motion } from "motion/react";
import type { Painting } from "@/lib/types/painting";
import PaintingCard from "./PaintingCard";
import { staggerChildren } from "@/components/motion/variants";

export default function PaintingGrid({ paintings }: { paintings: Painting[] }) {
    if (paintings.length === 0) {
        return <p className="text-ink-muted py-20 text-center">No paintings to show.</p>;
    }

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerChildren}
            className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-5 gap-y-10"
        >
            {paintings.map((p) => (
                <PaintingCard key={p.id} painting={p} />
            ))}
        </motion.div>
    );
}