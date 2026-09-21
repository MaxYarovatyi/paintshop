import Link from "next/link";
import PageContainer from "@/components/layout/PageContainer";

export const metadata = { title: "Inquiry received" };

export default function InquiryReceivedPage() {
  return (
    <PageContainer className="py-24 max-w-xl text-center">
      <h1 className="font-serif text-3xl mb-4 text-ink">Thank you!</h1>
      <p className="text-ink-muted mb-8">
        We have received your inquiry and will be in touch soon via your
        preferred contact method.
      </p>
      <Link href="/gallery" className="underline text-sm">
        Back to gallery
      </Link>
    </PageContainer>
  );
}
