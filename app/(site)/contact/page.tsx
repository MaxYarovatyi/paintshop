import PageContainer from "@/components/layout/PageContainer";
import {
  CONTACT_EMAIL,
  CONTACT_TELEGRAM_URL,
  CONTACT_WHATSAPP_URL,
} from "@/lib/brand";

export const metadata = {
  title: "Contact",
  description: "Get in touch about a painting, a commission or a project.",
};

const linkClass = "underline underline-offset-4 hover:text-ink";

export default function ContactPage() {
  return (
    <PageContainer className="py-12 md:py-16">
      <div className="max-w-xl">
        <h1 className="font-serif text-3xl mb-6 text-ink">Contact</h1>
        <p className="text-ink-muted leading-relaxed mb-8">
          For questions about a specific painting, use the inquiry form on its page. It lets
          you pick the contact method that works best for you, and we will follow up there
          directly.
        </p>

        <h2
          id="designers"
          className="text-xs uppercase tracking-[0.12em] text-ink-muted mb-3 scroll-mt-6"
        >
          Commissions, murals and other projects
        </h2>
        <p className="text-ink-muted leading-relaxed mb-4">
          For work that is not tied to a painting, write to us directly.
        </p>
        <ul className="space-y-2 text-ink-muted">
          <li>
            Email:{" "}
            <a href={`mailto:${CONTACT_EMAIL}`} className={linkClass}>
              {CONTACT_EMAIL}
            </a>
          </li>
          <li>
            Telegram:{" "}
            <a href={CONTACT_TELEGRAM_URL} className={linkClass} rel="noopener noreferrer">
              Open a chat
            </a>
          </li>
          <li>
            WhatsApp:{" "}
            <a href={CONTACT_WHATSAPP_URL} className={linkClass} rel="noopener noreferrer">
              Open a chat
            </a>
          </li>
        </ul>
      </div>
    </PageContainer>
  );
}
