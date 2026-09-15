import PaintingGrid from "@/components/gallery/PaintingGrid";
import ArtistStatement from "@/components/home/ArtistStatement";
import StatsRow from "@/components/home/StatsRow";
import PageContainer from "@/components/layout/PageContainer";
import Section from "@/components/layout/Section";
import { getFeaturedPaintings } from "@/lib/supabase/queries";

export default async function HomePage() {
    const featured = await getFeaturedPaintings();

    return (
        <>
        <PageContainer className="py-16 md:py-24">
            <section className="max-w-2xl mb-16">
                <h1 className="font-serif text-4xl md:text-5x1 leading-tight mb-4 text-ink">
                    Original abstract and postmodernist paintings.
                </h1>
                <p className="text-ink-muted">
                    Shipping worldwide from Ukraine — each piece is a unique original.
                </p>
            </section>

            <section>
                <h2 className="text-sm uppercase tracking-wide text-ink-muted mb-6">Featured</h2>
                <PaintingGrid paintings={featured} />
            </section>
        </PageContainer>

        <Section muted>
            <ArtistStatement />
        </Section>

        <Section>
            <StatsRow />
        </Section>
        </>
    );
}