"use client";
import { motion } from "motion/react";
import type { Painting } from "@/lib/types/painting";
import PaintingCard from "./PaintingCard";
import { staggerChildren } from "@/components/motion/variants";

export default function PaintingGrid({ paintings }: { paintings: Painting[] }) {
  if (paintings.length === 0) {
    return (
      <p className="text-ink-muted py-20 text-center">No paintings to show.</p>
    );
  }

  return (
    <motion.div
      initial={false}
      animate="visible"
      variants={staggerChildren}
      className="columns-2 lg:columns-3 gap-5"
    >
      {paintings.map((p, i) => (
        <div key={p.id} className="break-inside-avoid mb-8">
          <PaintingCard painting={p} priority={i < 4} />
        </div>
      ))}
    </motion.div>
  );
}
