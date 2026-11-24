import type { Painting } from "@/lib/types/painting";
import { formatPrice } from "./formatPrice";

/** Price and status text under a work. Sold works show no price. */
export function priceLabel(p: Pick<Painting, "status" | "priceUsd">): string {
  if (p.status === "sold") return "Sold";
  const price = formatPrice(p.priceUsd);
  return p.status === "reserved" ? `${price} \u00b7 Reserved` : price;
}

/**
 * Display ratio (width / height) of the work's main photo. Uses the stored pixel size
 * when known, otherwise the canvas size in cm. Clamped to avoid extreme shapes.
 */
export function paintingRatio(p: Painting): number {
  const image = p.images.find((i) => i.isPrimary) ?? p.images[0];
  const raw =
    image?.widthPx && image.heightPx
      ? image.widthPx / image.heightPx
      : p.widthCm / p.heightCm;
  return Math.min(Math.max(raw, 0.5), 2);
}
