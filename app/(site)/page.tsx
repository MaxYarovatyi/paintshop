import type { Metadata } from "next";
import AboutTeaser from "@/components/home/AboutTeaser";
import DesignersBlock from "@/components/home/DesignersBlock";
import FeaturedCarousel from "@/components/home/FeaturedCarousel";
import LinesBlock from "@/components/home/LinesBlock";
import SeriesBlock from "@/components/home/SeriesBlock";
import PageContainer from "@/components/layout/PageContainer";
import { ARTIST_NAME, SHOP_NAME, TAGLINE } from "@/lib/brand";
import { getLiveSeries, getPublicPaintings } from "@/lib/supabase/publicQueries";

export const metadata: Metadata = {
  title: { absolute: SHOP_NAME },
  description: TAGLINE,
};

export default async function HomePage() {
  const [paintings, live] = await Promise.all([getPublicPaintings(), getLiveSeries()]);
  const featured = paintings.filter((p) => p.isFeatured);
  const firstImage = (featured[0] ?? paintings[0])?.images[0]?.storagePath ?? null;

  return (
    <div className="home-snap">
      <section className="snap-block snap-first flex items-center py-8 lg:min-h-[calc(100svh-var(--header-h))] lg:py-6">
        <PageContainer className="w-full">
          <div className="mb-6 text-center lg:mb-8">
            <h1 className="font-serif text-3xl leading-tight text-ink md:text-5xl">{ARTIST_NAME}</h1>
            <p className="mt-2 text-ink-muted">{TAGLINE}</p>
          </div>
          {featured.length > 0 && <FeaturedCarousel paintings={featured} />}
        </PageContainer>
      </section>

      {live && live.paintings.length > 0 && (
        <SeriesBlock series={live.series} paintings={live.paintings} />
      )}
      <LinesBlock fallbackPaintingPath={firstImage} />
      <DesignersBlock />
      <AboutTeaser />
    </div>
  );
}
