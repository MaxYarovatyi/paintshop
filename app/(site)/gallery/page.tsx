import PaintingGrid from "@/components/gallery/PaintingGrid";
import PageContainer from "@/components/layout/PageContainer";
import { getPaintings } from "@/lib/supabase/queries";

export default async function GalleryPage() {
    const paintings = await getPaintings();

    return (
        <PageContainer className="py-16">
            <h1 className="font-serif text-3xl mb-10">Gallery</h1>
            <PaintingGrid paintings={paintings} />
        </PageContainer>
    );
}