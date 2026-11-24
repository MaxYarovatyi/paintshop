import FilterBar from "@/components/gallery/FilterBar";
import PaintingGrid from "@/components/gallery/PaintingGrid";
import PageContainer from "@/components/layout/PageContainer";
import { getPublicPaintings } from "@/lib/supabase/publicQueries";
import { Suspense } from "react";


export const metadata = {
  title: "Gallery — All Paintings",
  description: "Browse original abstract and postmodernist paintings available for purchase, shipping worldwide from Ukraine.",
};

type GalleryParams = Promise<{ tag?: string; available?: string }>;

export default function GalleryPage({ searchParams }: { searchParams: GalleryParams }) {
    return (
        <PageContainer className="py-12 md:py-16">
            <h1 className="font-serif text-3xl mb-8 text-ink">Gallery</h1>
            {/* The filter lives in the query string, which is request-time data.
                The works themselves come from one cached list and are filtered here. */}
            <Suspense fallback={<div className="min-h-[60vh]" />}>
                <GalleryContent searchParams={searchParams} />
            </Suspense>
        </PageContainer>
    );
}

async function GalleryContent({ searchParams }: { searchParams: GalleryParams }) {
    const { tag, available } = await searchParams;
    const availableOnly = available === "true";

    const all = await getPublicPaintings();
    const tags = Array.from(new Set(all.flatMap((p) => p.tags))).sort();
    const paintings = all.filter(
        (p) => (!tag || p.tags.includes(tag)) && (!availableOnly || p.status === "available"),
    );

    return (
        <>
            <FilterBar tags={tags} activeTag={tag as string} availableOnly={availableOnly} />
            <PaintingGrid paintings={paintings} />
        </>
    );
}
