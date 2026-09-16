import FilterBar from "@/components/gallery/FilterBar";
import PaintingGrid from "@/components/gallery/PaintingGrid";
import PageContainer from "@/components/layout/PageContainer";
import { getAllTags, getPaintings } from "@/lib/supabase/queries";


export const metadata = {
  title: "Gallery — All Paintings",
  description: "Browse original abstract and postmodernist paintings available for purchase, shipping worldwide from Ukraine.",
};

export default async function GalleryPage({searchParams}: {searchParams: Promise<{tag?: string; available?:string}>}) {
    const {tag, available} = await searchParams;
    const availableOnly = available === "true";
    
    const [paintings, tags] = await Promise.all([
        getPaintings({tag,availableOnly}),
        getAllTags()
    ]);

    return (
        <PageContainer className="py-12 md:py-16">
            <h1 className="font-serif text-3xl mb-8 text-ink">Gallery</h1>
            <FilterBar tags={tags} activeTag={tag as string} availableOnly={availableOnly} />
            <PaintingGrid paintings={paintings} />
        </PageContainer>
    );
}