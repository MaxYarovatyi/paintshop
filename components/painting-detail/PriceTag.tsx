import {formatPrice} from "@/lib/utils/formatPrice";
import type { PaintingStatus } from "@/lib/types/painting";

export default function PriceTag({priceUsd,status}: {priceUsd: number; status: PaintingStatus})
{
    if(status === "available")
    {
        return <span className="text-xl">{formatPrice(priceUsd)}</span>;
    }
    return (
        <div className="flex items-center gap-3">
            <span className="text-xl text-neutral-400 line-through">{formatPrice(priceUsd)}</span>
            <span className="text-sm uppercase tracking-wide text-ink-muted">{status}</span>
        </div>
    )
}