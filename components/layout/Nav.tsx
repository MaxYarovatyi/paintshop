"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const links = [
    { href: "/gallery", label: "Gallery" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" }
];

export default function Nav() {
    const pathname = usePathname();
    const [open, setOpen] = useState(false);

    return (
        <>
        <nav className="hidden sm:flex gap-6 text-sm">
            {links.map((l) => (
                <Link
                    key={l.href}
                    href={l.href}
                    className={pathname === l.href ? "text-ink" : "text-ink-muted hover:text-ink"}
                >
                    {l.label}
                </Link>
            ))}
        </nav>

        <button 
            onClick={()=> setOpen(!open)}
            className="sm:hidden text-sm text-ink"
            aria-expanded={open}
            aria-label="Toggle menu">
            {open ? "Close": "Menu"}
        </button>

        {open && (
            <div className="absolute top-full left-0 right-0 sm:hidden bg-canvas border-b border-canvas-border">
          <nav className="flex flex-col px-6 py-4 gap-4 text-sm">
            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className={pathname === l.href ? "text-ink" : "text-ink-muted"}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        )}
        </>
    )
}
