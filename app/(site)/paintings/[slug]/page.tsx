import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPaintingBySlug } from "@/lib/supabase/queries";
import ImageViewer from "@/components/painting-detail/ImageViewer";
import PriceTag from "@/components/painting-detail/PriceTag";
import InquiryForm from "@/components/painting-detail/InquiryForm";
import PageContainer from "@/components/layout/PageContainer";
import { getPaintingImageUrl } from "@/lib/utils/imageUrl";
import DetailsGrid from "@/components/painting-detail/DetailsGrid";
import ShareButtons from "@/components/painting-detail/ShareButtons";
import { SITE_URL } from "@/lib/site";

export async function generateMetadata({params}:{params:Promise<{slug:string}>}): Promise<Metadata> {
  const {slug} = await params;
  const painting = await getPaintingBySlug(slug);
  if(!painting) return {title: "Painting not found"};

  const primaryImage = painting.images.find((i)=> i.isPrimary) ?? painting.images[0];

  return {
    title: `${painting.title} – Original ${painting.medium}`,
    description: painting.description || `${painting.title}, ${painting.medium}, ${painting.widthCm}x${painting.heightCm} cm. Original painting shipping from Ukraine`,
    openGraph: {
      title: painting.title,
      description: painting.description,
      images: primaryImage? [{url: getPaintingImageUrl(primaryImage.storagePath)}] : [],
    }
  }
}

export default async function PaintingDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const painting = await getPaintingBySlug(slug);
  if (!painting) notFound();

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: painting.title,
  description: painting.description,
  image: painting.images.map((img) => getPaintingImageUrl(img.storagePath)),
  offers: {
    "@type": "Offer",
    priceCurrency: "USD",
    price: painting.priceUsd,
    availability:
      painting.status === "available"
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
  },
};

  return (
    <PageContainer className="py-12 md:py-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-8 md:gap-16">
        <ImageViewer images={painting.images} title={painting.title} widthCm={painting.widthCm} heightCm={painting.heightCm}/>

        <div>
          <h1 className="font-serif text-3xl md:text-4xl mb-6 text-ink">
            {painting.title}
          </h1>

          <PriceTag priceUsd={painting.priceUsd} status = {painting.status} />

          <DetailsGrid
            medium={painting.medium}
            widthCm={painting.widthCm}
            heightCm={painting.heightCm}
            yearCreated={painting.yearCreated}
          />
          <p className="text-ink leading-relaxed text-base md:text-lg my-6">
            {painting.description}
          </p>

          <ShareButtons url={`${SITE_URL}/paintings/${painting.slug}`} title={painting.title} />

          {painting.status === "available" && (
            <div className="mt-10">
              <InquiryForm
                paintingId={painting.id}
                paintingTitle={painting.title}
                paintingSlug={painting.slug}
              />
            </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
