"use client";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { Painting } from "@/lib/types/painting";
import { getPaintingImageUrl } from "@/lib/utils/imageUrl";
import { priceLabel } from "@/lib/utils/paintingDisplay";

const INTERVAL_MS = 7000;
const SWIPE_PX = 40;

function subscribeReducedMotion(cb: () => void) {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}
const getReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function subscribeVisibility(cb: () => void) {
  document.addEventListener("visibilitychange", cb);
  return () => document.removeEventListener("visibilitychange", cb);
}
const getTabHidden = () => document.hidden;

const controlClass =
  "inline-flex h-11 min-w-11 items-center justify-center px-2 text-sm text-ink-muted hover:text-ink";

/**
 * One featured work at a time. The first slide is in the server HTML and visible without
 * JavaScript. Slides crossfade with CSS. Autoplay pauses on hover, focus, touch and when
 * the tab is hidden, stops once the visitor uses a control, and never runs with reduced motion.
 */
export default function FeaturedCarousel({ paintings }: { paintings: Painting[] }) {
  const n = paintings.length;
  const [index, setIndex] = useState(0);
  // Images are mounted for the current slide and one ahead only.
  const [seen, setSeen] = useState<number[]>(() => (n > 1 ? [0, 1] : [0]));
  const [stopped, setStopped] = useState(false);
  const [userPaused, setUserPaused] = useState(false);
  const [engaged, setEngaged] = useState(false);
  const touchStartX = useRef<number | null>(null);

  const reduced = useSyncExternalStore(subscribeReducedMotion, getReducedMotion, () => false);
  const tabHidden = useSyncExternalStore(subscribeVisibility, getTabHidden, () => false);
  const autoplay = n > 1 && !reduced && !stopped && !userPaused && !engaged && !tabHidden;

  const goTo = useCallback(
    (next: number) => {
      const i = (next + n) % n;
      setIndex(i);
      setSeen((s) => Array.from(new Set([...s, i, (i + 1) % n])));
    },
    [n],
  );

  useEffect(() => {
    if (!autoplay) return;
    const id = setTimeout(() => goTo(index + 1), INTERVAL_MS);
    return () => clearTimeout(id);
  }, [autoplay, index, goTo]);

  function manual(next: number) {
    setStopped(true);
    goTo(next);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (n < 2) return;
    if (e.key === "ArrowLeft") manual(index - 1);
    if (e.key === "ArrowRight") manual(index + 1);
  }

  function onTouchEnd(e: React.TouchEvent) {
    setEngaged(false);
    const start = touchStartX.current;
    touchStartX.current = null;
    if (start === null || n < 2) return;
    const dx = e.changedTouches[0].clientX - start;
    if (Math.abs(dx) >= SWIPE_PX) manual(index + (dx < 0 ? 1 : -1));
  }

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured works"
      onKeyDown={onKeyDown}
      onMouseEnter={() => setEngaged(true)}
      onMouseLeave={() => setEngaged(false)}
      onFocus={() => setEngaged(true)}
      onBlur={() => setEngaged(false)}
      onTouchStart={(e) => {
        setEngaged(true);
        touchStartX.current = e.touches[0].clientX;
      }}
      onTouchEnd={onTouchEnd}
    >
      {/* The stage has a fixed height, so nothing shifts when slides change. */}
      <div
        aria-live={autoplay ? "off" : "polite"}
        className="relative h-[calc(60svh+4.5rem)] sm:h-[calc(60svh+3.5rem)] lg:h-[calc(min(75svh,calc(100svh-22rem))+3.5rem)]"
      >
        {paintings.map((p, i) => {
          const active = i === index;
          const image = p.images.find((im) => im.isPrimary) ?? p.images[0];
          return (
            <div
              key={p.id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${n}: ${p.title}`}
              aria-hidden={!active}
              inert={!active}
              className={`absolute inset-0 transition-opacity duration-[600ms] motion-reduce:transition-none ${
                active ? "opacity-100" : "pointer-events-none opacity-0"
              }`}
            >
              <Link href={`/paintings/${p.slug}`} className="flex h-full flex-col">
                <div className="relative min-h-0 flex-1">
                  {image && seen.includes(i) ? (
                    <Image
                      src={getPaintingImageUrl(image.storagePath)}
                      alt={image.altText || p.title}
                      fill
                      sizes="100vw"
                      priority={i === 0}
                      className="object-contain"
                    />
                  ) : null}
                </div>
                <p className="flex h-[4.5rem] items-start justify-center pt-4 text-center text-sm text-ink-muted sm:h-14">
                  <span>
                    {[p.title, p.medium, `${p.widthCm}×${p.heightCm} cm`, priceLabel(p)].join(
                      " · ",
                    )}
                  </span>
                </p>
              </Link>
            </div>
          );
        })}
      </div>

      {n > 1 && (
        <div className="mt-2 flex items-center justify-center gap-2">
          <button
            type="button"
            className={controlClass}
            aria-label="Previous work"
            onClick={() => manual(index - 1)}
          >
            &larr;
          </button>
          <span className="min-w-12 text-center text-sm tabular-nums text-ink-muted">
            {index + 1} / {n}
          </span>
          <button
            type="button"
            className={controlClass}
            aria-label="Next work"
            onClick={() => manual(index + 1)}
          >
            &rarr;
          </button>
          {!reduced && (
            <button
              type="button"
              className={`${controlClass} ml-2`}
              onClick={() => {
                if (autoplay) {
                  setUserPaused(true);
                } else {
                  setUserPaused(false);
                  setStopped(false);
                }
              }}
            >
              {autoplay ? "Pause" : "Play"}
            </button>
          )}
        </div>
      )}
    </section>
  );
}
