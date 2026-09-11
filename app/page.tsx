import PaintingGrid from "@/components/gallery/PaintingGrid";
import { mockPaintings } from "@/lib/mock/paintings";

export default function HomePage() {
  const featured = mockPaintings.filter((p) => p.isFeatured);

  return (
    <div className="py-16">
      <section className="max-w-2xl mb-16">
        <h1 className="font-serif text-4xl leading-tight mb-4">
          Original abstract and postmodernist paintings.
        </h1>
        <p className="text-neutral-500">
          Shipping worldwide from Ukraine — each piece is a unique original.
        </p>
      </section>

      <section>
        <h2 className="text-sm uppercase tracking-wide text-neutral-500 mb-6">Featured</h2>
        <PaintingGrid paintings={featured} />
      </section>
    </div>
  );
}