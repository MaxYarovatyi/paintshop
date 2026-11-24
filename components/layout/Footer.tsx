import Link from "next/link";
import { cacheLife } from "next/cache";
import { SHOP_NAME } from "@/lib/brand";

export default async function Footer() {
    "use cache";
    cacheLife("days");
    return (
        <footer className="mt-24 border-t border-neutral-200">
            <div className="mx-auto max-w-content px-6 md:px-10 py-10 text-sm flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
                <span className="text-ink-muted"> &copy; {new Date().getFullYear()} {SHOP_NAME}</span>
                <span className="text-ink-muted">Shipping to Ukraine, Europe, USA</span>
                <Link href="/shipping-returns" className="text-ink underline-offset-4 hover:underline">Shipping and Returns</Link>
            </div>
        </footer>
    )
}