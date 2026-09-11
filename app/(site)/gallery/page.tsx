import PaintingGrid from "@/components/gallery/PaintingGrid";
import { mockPaintings } from "@/lib/mock/paintings";

export default function GalleryPage() {
    return (
        <div className="py-16">
            <h1 className="font-serif text-3xl mb-10">Gallery</h1>
            <PaintingGrid paintings={mockPaintings} />
        </div>
    );
}