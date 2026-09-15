"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
    { href: "/gallery", label: "Gallery" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" }
];

export default function Nav() {
    const pathname = usePathname();
    return (
        <nav className="flex gap-6 text-sm">
            {links.map((l) => (
                <Link
                    key={l.href}
                    href={l.href}
                    className={pathname === l.href ? "text-accent" : "text-ink-muted hover:text-ink"}
                >
                    {l.label}
                </Link>
            ))}
        </nav>
    )
}
