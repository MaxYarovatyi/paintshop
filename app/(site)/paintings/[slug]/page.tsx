import { notFound } from "next/navigation";
import { getPaintingBySlug } from "@/lib/supabase/queries";
import ImageViewer from "@/components/painting-detail/ImageViewer";
import PriceTag from "@/components/painting-detail/PriceTag";
import InquiryForm from "@/components/painting-detail/InquiryForm";

export default async function PaintingDetailPage({params}: {params: Promise<{slug: string}>})
{
    const {slug} = await params;
    const painting = await getPaintingBySlug(slug);
    if(!painting) notFound();

    return(
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 gap-12">
      <ImageViewer images={painting.images} title={painting.title} />

      <div>
        <h1 className="font-serif text-3xl mb-2">{painting.title}</h1>
        <p className="text-neutral-500 mb-4">
          {painting.medium} · {painting.widthCm}×{painting.heightCm} cm
          {painting.yearCreated ? ` · ${painting.yearCreated}` : ""}
        </p>
        <PriceTag priceUsd={painting.priceUsd} status={painting.status} />
        <p className="mt-6 text-neutral-700 leading-relaxed">{painting.description}</p>

        {painting.status === "available" && (
          <div className="mt-10">
            <InquiryForm paintingTitle={painting.title} />
          </div>
        )}
      </div>
    </div>
    )
}