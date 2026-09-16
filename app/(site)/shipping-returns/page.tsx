// app/(site)/shipping-returns/page.tsx
import PageContainer from "@/components/layout/PageContainer";

export const metadata = {
  title: "Shipping & Returns",
  description: "Shipping zones, timelines, and returns policy for original paintings.",
};

export default function ShippingReturnsPage() {
  return (
    <PageContainer className="py-12 md:py-16 max-w-2xl">
      <h1 className="font-serif text-3xl mb-8 text-ink">Shipping & Returns</h1>

      <section className="mb-10">
        <h2 className="font-serif text-xl mb-3 text-ink">Shipping</h2>
        <p className="text-ink-muted leading-relaxed mb-3">
          Each painting is an original, one-of-a-kind piece, carefully packaged to protect it in transit.
          Shipping costs and timelines vary by destination:
        </p>
        <ul className="text-ink-muted leading-relaxed list-disc pl-5 space-y-1">
          <li>Ukraine — via Nova Poshta, typically 1–3 business days</li>
          <li>Europe — international courier, typically 7–14 business days</li>
          <li>United States — international courier, typically 10–21 business days</li>
        </ul>
        <p className="text-ink-muted leading-relaxed mt-3">
          Exact shipping cost is confirmed with you directly after your inquiry, based on destination and
          package size. Customs fees or import duties, if applicable, are the buyer&apos;s responsibility.
        </p>
      </section>

      <section>
        <h2 className="font-serif text-xl mb-3 text-ink">Returns</h2>
        <p className="text-ink-muted leading-relaxed mb-3">
          Because each piece is a unique original, we generally do not accept returns for change of mind.
        </p>
        <p className="text-ink-muted leading-relaxed">
          If your painting arrives damaged in transit, contact us within 48 hours of delivery with photos
          of the damage and packaging — we&apos;ll work with you on a resolution.
        </p>
      </section>
    </PageContainer>
  );
}