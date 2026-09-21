"use client"
import { useState } from "react"
import { CheckIcon, FacebookIcon, LinkIcon, TelegramIcon, XIcon } from "../icons/ShareIcons";

export default function ShareButtons({url, title}: {url:string; title:string}) {
    const [copied, setCopied] = useState(false);

    async function handleCopy() {
        try {
            await navigator.clipboard.writeText(url);
            setCopied(true);
            setTimeout(()=> setCopied(false), 2000);
        } catch {

        }
    }

    const encodedUrl = encodeURIComponent(url);
    const encodedTitle = encodeURIComponent(title);

    const links = [
        {label: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, Icon: FacebookIcon},
        {label: "Telegram", href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`, Icon: TelegramIcon},
        {label: "X", href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`, Icon: XIcon}
    ];

    return (
        <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wide text-inl-muted mr-1">Share</span>
            <button onClick={handleCopy} className="w-8 h-8 flex items-center justify-center border border-canvas-border text-ink-muted hover:border-ink hover:text-ink transition-colors">
                {copied ? <CheckIcon className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
            </button>
            {links.map(({label, href, Icon})=> (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={`Share on ${label}`} className="w-8 h-8 flex items-center justify-center border border-canvas-border text-ink-muted hover:border-ink hover:text-ink transition-colors">
                    <Icon className="w-4 h-4" /> 
                </a>
            ))}
        </div>
    )
}