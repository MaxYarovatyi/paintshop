"use client"
import { useState } from "react"
import { CheckIcon, LinkIcon, TelegramIcon } from "../icons/ShareIcons";

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
        {label: "Telegram", href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`, Icon: TelegramIcon},
    ];

    return (
        <div className="flex items-center gap-2">
            <span className="text-xs uppercase tracking-wide text-ink-muted mr-1">Share</span>
            <button onClick={handleCopy} aria-label="Copy link" className="w-11 h-11 sm:w-8 sm:h-8 flex items-center justify-center border border-canvas-border text-ink-muted hover:border-ink hover:text-ink transition-colors">
                {copied ? <CheckIcon className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
            </button>
            {links.map(({label, href, Icon})=> (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={`Share on ${label}`} className="w-11 h-11 sm:w-8 sm:h-8 flex items-center justify-center border border-canvas-border text-ink-muted hover:border-ink hover:text-ink transition-colors">
                    <Icon className="w-4 h-4" /> 
                </a>
            ))}
        </div>
    )
}