"use client";
import { useEffect, useState, useTransition } from "react";
import { submitInquiry } from "@/lib/actions/inquiries";
import { useRouter } from "next/navigation";
import { CONTACT_CHANNELS } from "@/lib/inquiries/types";
import { COUNTRIES } from "@/lib/inquiries/countries";
import { resolveContactMode } from "@/lib/inquiries/validation";
import { inquirySchema, fieldErrors, MAX_MESSAGE } from "@/lib/inquiries/schema";
import { getFormToken } from "@/lib/actions/formToken";
import ContactFields from "./ContactFields";
import TurnstileWidget from "./TurnstileWidget";

export default function InquiryForm({ paintingId }: { paintingId: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [channel, setChannel] = useState<string>(CONTACT_CHANNELS[0].name);
  const [contactValue, setContactValue] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [message, setMessage] = useState("");
  const [contactError, setContactError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [messageError, setMessageError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [formToken, setFormToken] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");

  useEffect(() => {
    getFormToken().then(setFormToken).catch(() => {});
  }, []);

  const country = COUNTRIES.find((c)=> c.code === countryCode);

  function handleChannelChange(next:string)
  {
    if(resolveContactMode(channel, contactValue) !== resolveContactMode(next, contactValue))
      setContactValue("");
    setChannel(next);
    setContactError(null);
  }

  function composeContact(): string {
    const raw = contactValue.trim();
    if(resolveContactMode(channel, raw) === "username") return raw;

    const compact = raw.replace(/[\s\-()]/g, "");
    if(compact.startsWith("+")) return compact;
    if(!country) return compact;

    const national = countryCode === "IT" ? compact : compact.replace(/^0/,"");
    return `${country.dialCode}${national}`;
  }

  function applyFieldErrors(f: Partial<Record<string, string>>) {
    setNameError(f.name ?? null);
    setMessageError(f.message ?? null);
    setContactError(f.country ?? f.contact ?? f.channel ?? null);
  }

  function handleSubmit(e: React.FormEvent)
  {
    e.preventDefault();
    setError(null);

    const parsed = inquirySchema.safeParse({
      productId: paintingId,
      name,
      channel,
      contact: composeContact(),
      country: country?.name ?? "",
      message: message || undefined,
    });
    if (!parsed.success) {
      applyFieldErrors(fieldErrors(parsed.error));
      return;
    }
    applyFieldErrors({});

    startTransition(async () => {
      try {
        const result = await submitInquiry({
          ...parsed.data,
          website: honeypot,
          formToken,
          turnstileToken,
        });
        if (result.ok) {
          router.push("/inquiry-received");
          return;
        }
        applyFieldErrors(result.fields ?? {});
        setError(result.error);
      } catch {
        setError("Your inquiry could not be sent. Please try again later.");
      }
    });
  }

  return (
     <form onSubmit={handleSubmit} className="relative space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}

      <div>
        <p className="text-sm text-ink-muted mb-2">Preferred contact method</p>
        <div className="flex flex-wrap gap-2">
          {CONTACT_CHANNELS.map((c) => (
            <button
              key={c.name}
              type="button"
              onClick={() => handleChannelChange(c.name)}
              className={`px-3 py-1.5 text-sm border transition-colors ${
                channel === c.name ? "border-ink bg-ink text-canvas" : "border-canvas-border text-ink-muted"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required maxLength={80}
        className="w-full border-b border-canvas-border py-2 text-sm focus:outline-none focus:border-ink" />
      {nameError && <p className="text-xs text-red-600 -mt-2">{nameError}</p>}

      <ContactFields
        channel={channel}
        value={contactValue}
        onValueChange={setContactValue}
        countryCode={countryCode}
        onCountryChange={setCountryCode}
        error={contactError}
      />

      <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message (optional)" rows={3} maxLength={MAX_MESSAGE}
        className="w-full border-b border-canvas-border py-2 text-sm focus:outline-none focus:border-ink" />
      {messageError && <p className="text-xs text-red-600 -mt-2">{messageError}</p>}

      {/* Honeypot: hidden from people, filled by bots. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off"
            value={honeypot} onChange={(e) => setHoneypot(e.target.value)} />
        </label>
      </div>

      <TurnstileWidget onToken={setTurnstileToken} />

      <button type="submit" disabled={isPending || !formToken || !turnstileToken}
        className="w-full bg-ink text-canvas py-3 text-sm uppercase tracking-wide disabled:opacity-50">
        {isPending ? "Sending…" : "Send inquiry"}
      </button>
    </form>
  )
}