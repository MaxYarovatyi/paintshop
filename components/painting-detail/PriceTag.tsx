import { formatPrice } from "@/lib/utils/formatPrice";
import type { PaintingStatus } from "@/lib/types/painting";

export default function PriceTag({ priceUsd, status }: { priceUsd: number; status: PaintingStatus }) {
  if (status === "sold") {
    return <span className="text-sm uppercase tracking-wide text-ink-muted">Sold</span>;
  }
  return (
    <div className="flex items-baseline gap-3">
      <span className="text-xl">{formatPrice(priceUsd)}</span>
      {status === "reserved" && (
        <span className="text-sm uppercase tracking-wide text-ink-muted">Reserved</span>
      )}
    </div>
  );
}
