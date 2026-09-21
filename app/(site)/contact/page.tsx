import PageContainer from "@/components/layout/PageContainer";

export const metadata = {
  title: "Contact",
  description: "Get in touch about a painting or a commission.",
};

export default function ContactPage() {
  return (
    <PageContainer className="py-12 md:py-16 max-w-xl">
      <h1 className="font-serif text-3xl mb-6 text-ink">Contact</h1>
      <p className="text-ink-muted leading-relaxed"> For questions about a specific painting, use the inquiry form on its page — it lets you pick
        the contact method that works best for you, and we&apos;ll follow up there directly.</p>
    </PageContainer>
  );
}