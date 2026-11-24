import Image from "next/image";
import Link from "next/link";
import PageContainer from "@/components/layout/PageContainer";
import Eyebrow from "@/components/layout/Eyebrow";
import type { Painting } from "@/lib/types/painting";
import type { Series } from "@/lib/types/series";
import { getPaintingImageUrl } from "@/lib/utils/imageUrl";
import { paintingRatio, priceLabel } from "@/lib/utils/paintingDisplay";

export default function SeriesBlock({
  series,
  paintings,
}: {
  series: Series;
  paintings: Painting[];
}) {
  return (
    <section className="snap-block flex items-center py-12 md:py-16 lg:min-h-[100svh]">
      <PageContainer className="w-full">
        <div className="mb-8 max-w-2xl">
          <Eyebrow>Series</Eyebrow>
          <h2 className="mb-3 font-serif text-2xl text-ink md:text-4xl">{series.title}</h2>
          {series.intro && <p className="leading-relaxed text-ink-muted">{series.intro}</p>}
        </div>

        {/* Natural proportions, aligned to the bottom. Scrolls sideways when it does not fit. */}
        <ul className="-mx-6 mb-6 flex snap-x snap-mandatory items-end gap-8 overflow-x-auto px-6 pb-4 md:-mx-10 md:px-10 lg:snap-none">
          {paintings.map((p) => {
            const image = p.images.find((i) => i.isPrimary) ?? p.images[0];
            return (
              <li key={p.id} className="shrink-0 snap-start">
                <Link href={`/paintings/${p.slug}`} className="group block">
                  <div
                    style={{ aspectRatio: paintingRatio(p) }}
                    className="relative h-[38svh] lg:h-[40svh]"
                  >
                    {image && (
                      <Image
                        src={getPaintingImageUrl(image.storagePath)}
                        alt={image.altText || p.title}
                        fill
                        sizes="(max-width: 1024px) 60vw, 25vw"
                        className="object-contain transition-opacity duration-300 group-hover:opacity-90"
                      />
                    )}
                  </div>
                  <p className="mt-3 text-sm text-ink">{p.title}</p>
                  <p className="text-sm text-ink-muted">{priceLabel(p)}</p>
                </Link>
              </li>
            );
          })}
        </ul>

        {/* A dedicated series page does not exist yet, so this goes to the gallery. */}
        <Link
          href="/gallery"
          className="inline-flex min-h-11 items-center text-ink underline-offset-4 hover:underline"
        >
          View the series
        </Link>
      </PageContainer>
    </section>
  );
}
