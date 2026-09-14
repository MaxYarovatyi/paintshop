import PaintingGrid from "@/components/gallery/PaintingGrid";
import { getPaintings } from "@/lib/supabase/queries";

export default async function GalleryPage() {
    const paintings = await getPaintings();

    return (
        <div className="py-16">
            <h1 className="font-serif text-3xl mb-10">Gallery</h1>
            <PaintingGrid paintings={paintings} />
        </div>
    );
}