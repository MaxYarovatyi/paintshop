import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPublicPaintingBySlug, getPublicPaintings } from "@/lib/supabase/publicQueries";
import ImageViewer from "@/components/painting-detail/ImageViewer";
import PriceTag from "@/components/painting-detail/PriceTag";
import InquiryForm from "@/components/painting-detail/InquiryForm";
import PageContainer from "@/components/layout/PageContainer";
import { getPaintingImageUrl } from "@/lib/utils/imageUrl";
import ShareButtons from "@/components/painting-detail/ShareButtons";
import { SITE_URL, SHOP_NAME, ARTIST_NAME } from "@/lib/brand";

// Known works are prerendered at build time. Other slugs render on first request and are
// then cached. At least one param is required, so an empty catalog gets a placeholder
// that resolves to a 404.
export async function generateStaticParams() {
  const paintings = await getPublicPaintings();
  const params = paintings.map((p) => ({ slug: p.slug }));
  return params.length > 0 ? params : [{ slug: "_" }];
}

export async function generateMetadata({params}:{params:Promise<{slug:string}>}): Promise<Metadata> {
  const {slug} = await params;
  const painting = await getPublicPaintingBySlug(slug);
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
  const painting = await getPublicPaintingBySlug(slug);
  if (!painting) notFound();

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Product",
  name: painting.title,
  description: painting.description,
  image: painting.images.map((img) => getPaintingImageUrl(img.storagePath)),
  brand: { "@type": "Brand", name: SHOP_NAME },
  creator: { "@type": "Person", name: ARTIST_NAME },
  url: `${SITE_URL}/paintings/${painting.slug}`,
  // Sold works carry no price anywhere, including structured data.
  ...(painting.status === "sold"
    ? {}
    : {
        offers: {
          "@type": "Offer",
          priceCurrency: "USD",
          price: painting.priceUsd,
          availability:
            painting.status === "available"
              ? "https://schema.org/InStock"
              : "https://schema.org/OutOfStock",
        },
      }),
};

  return (
    <PageContainer className="py-6 md:py-10">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px] xl:grid-cols-[minmax(0,1fr)_420px] gap-8 lg:gap-12">
        <ImageViewer images={painting.images} title={painting.title} />

        <div className="lg:pt-2">
          <h1 className="font-serif text-3xl md:text-4xl leading-tight text-ink">
            {painting.title}
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            {[
              painting.medium,
              `${painting.widthCm} x ${painting.heightCm} cm`,
              painting.yearCreated,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>

          <div className="mt-6 mb-8">
            <PriceTag priceUsd={painting.priceUsd} status={painting.status} />
          </div>

          {painting.description && (
            <p className="mb-10 text-ink leading-relaxed">{painting.description}</p>
          )}

          {painting.status === "available" && (
            <section aria-labelledby="inquire" className="mb-10">
              <h2 id="inquire" className="mb-4 text-xs uppercase tracking-wide text-ink-muted">
                Inquire about this work
              </h2>
              <InquiryForm paintingId={painting.id} />
            </section>
          )}
          {painting.status === "reserved" && (
            <p className="mb-10 text-sm text-ink-muted">
              This work is reserved. Contact us if you would like to be informed should it become available again.
            </p>
          )}

          <div>
            <ShareButtons url={`${SITE_URL}/paintings/${painting.slug}`} title={painting.title} />
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
