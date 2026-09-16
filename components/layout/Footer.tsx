import Link from "next/link";

export default function Footer() {
    return (
        <footer className="mt-24 border-t border-neutral-200">
            <div className="mx-auto max-w-content px-6 md:px-10 py-10 text-sm text-ink-muted flex justify-between">
                <span> {new Date().getFullYear()} Gallery</span>
                <span>Shipping to Ukraine, Europe, USA</span>
                <Link href="/shipping-returns" className="hover:text-ink">Shipping and Returns</Link>
            </div>
        </footer>
    )
}