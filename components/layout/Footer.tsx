import Link from "next/link";
import { cacheLife } from "next/cache";
import { SHOP_NAME } from "@/lib/brand";

export default async function Footer() {
    "use cache";
    cacheLife("days");
    return (
        <footer className="mt-24 border-t border-neutral-200">
            <div className="mx-auto max-w-content px-6 md:px-10 py-10 text-sm text-ink-muted flex justify-between">
                <span> &copy; {new Date().getFullYear()} {SHOP_NAME}</span>
                <span>Shipping to Ukraine, Europe, USA</span>
                <Link href="/shipping-returns" className="hover:text-ink">Shipping and Returns</Link>
            </div>
        </footer>
    )
}