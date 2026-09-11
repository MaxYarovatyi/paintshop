"use client";
import { motion } from "motion/react";
import type { Painting } from "@/lib/types/painting";
import PaintingCard from "./PaintingCard";
import { staggerChildren } from "@/components/motion/variants";

export default function PaintingGrid({ paintings }: { paintings: Painting[] }) {
    if (paintings.length === 0) {
        return <p className="text-neutral-500 py-20 text-center">No paintings to show.</p>;
    }

    return (
        <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerChildren}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-12"
        >
            {paintings.map((p) => (
                <PaintingCard key={p.id} painting={p} />
            ))}
        </motion.div>
    );
}