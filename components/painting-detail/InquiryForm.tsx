"use client";
import { useState, useTransition } from "react";
import { submitInquiry } from "@/lib/actions/inquiries";
import { useRouter } from "next/navigation";
import { CONTACT_CHANNELS } from "@/lib/inquiries/types";
import {
  COUNTRIES,
  type ShippingZone,
  ZONE_LABELS,
} from "@/lib/inquiries/countries";
import {
  CHANNEL_CONTACT_TYPE,
  contactErrorMessage,
  contactPlaceholder,
  resolveContactMode,
  validateContact,
} from "@/lib/inquiries/validation";
import ContactFields from "./ContactFields";

const ZONES: ShippingZone[] = ["ukraine", "europe", "usa"];

export default function InquiryForm({
  paintingId,
  paintingTitle,
  paintingSlug,
}: {
  paintingId: string;
  paintingTitle: string;
  paintingSlug: string;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [channel, setChannel] = useState<string>(CONTACT_CHANNELS[0].name);
  const [contactValue, setContactValue] = useState("");
  const [countryCode, setCountryCode] = useState("");
  const [message, setMessage] = useState("");
  const [contactError, setContactError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

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

  function handleSubmit(e: React.FormEvent)
  {
    e.preventDefault();
    setError(null);

    if(!country) {
      setContactError("Please select your country");
      return;
    }

    const composed = composeContact();
    if(!validateContact(channel, composed)){
      setContactError(contactErrorMessage(channel));
      return;
    }
    setContactError(null);

    startTransition(async () => {
      try {
        await submitInquiry(
        {
          paintingId,
          paintingTitle,
          paintingSlug,
          buyerName: name,
          buyerContact: composed,
          buyerCountry: country.name,
          message: message || undefined,
        }, channel);
        router.push("/inquiry-received");
      }
      catch (err)
      {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    })
  }

  return (
     <form onSubmit={handleSubmit} className="space-y-4">
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

      <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required
        className="w-full border-b border-canvas-border py-2 text-sm focus:outline-none focus:border-ink" />

      <ContactFields
        channel={channel}
        value={contactValue}
        onValueChange={setContactValue}
        countryCode={countryCode}
        onCountryChange={setCountryCode}
        error={contactError}
      />

      <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Message (optional)" rows={3}
        className="w-full border-b border-canvas-border py-2 text-sm focus:outline-none focus:border-ink" />

      <button type="submit" disabled={isPending}
        className="w-full bg-ink text-canvas py-3 text-sm uppercase tracking-wide disabled:opacity-50">
        {isPending ? "Sending…" : "Send inquiry"}
      </button>
    </form>
  )
}