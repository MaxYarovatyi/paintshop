"use client";
import { useState, useTransition } from "react";
import { submitInquiry } from "@/lib/actions/inquiries";
import { useRouter } from "next/navigation";
import { CONTACT_CHANNELS } from "@/lib/inquiries/types";
import {
  COUNTRIES,
  ShippingZone,
  ZONE_LABELS,
} from "@/lib/inquiries/countries";
import {
  CHANNEL_CONTACT_TYPE,
  contactErrorMessage,
  contactPlaceholder,
  validateContact,
} from "@/lib/inquiries/validation";

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
  const [contact, setContact] = useState("");
  const [autoFilledPrefix, setAutoFilledPrefix] = useState<string | null>(null);
  const [countryCode, setCountryCode] = useState("");
  const [message, setMessage] = useState("");
  const [channel, setChannel] = useState<string>(CONTACT_CHANNELS[0].name);
  const [contactError, setContactError] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const contactType = CHANNEL_CONTACT_TYPE[channel];

  function applyDialCodeIfSafe(code: string) {
    const country = COUNTRIES.find((c) => c.code === code);
    if (!country) return;
    if (contactType === "phone" || contactType === "phone_or_username") {
      if (
        contact === "" ||
        (autoFilledPrefix && contact === autoFilledPrefix)
      ) {
        const prefilled = `${country.dialCode}`;
        setContact(prefilled);
        setAutoFilledPrefix(prefilled);
      }
    }
  }

  function handleCountryChange(code: string) {
    setCountryCode(code);
    applyDialCodeIfSafe(code);
  }

  function handleChannelChange(name: string) {
    setChannel(name);
    setContactError(null);
    const type = CHANNEL_CONTACT_TYPE[name];
    if (
      (type === "phone" || type === "phone_or_username") &&
      contact === "" &&
      countryCode
    )
      applyDialCodeIfSafe(countryCode);
  }

  function handleContactChange(value: string) {
    if (
      channel === "telegram" &&
      /[a-zA-Z@]/.test(value) &&
      /^\+\d+\s*/.test(value)
    ) {
      setContact(value.replace(/^\+\d+\s*/, ""));
      setAutoFilledPrefix(null);
      return;
    }
    setContact(value);
    if (autoFilledPrefix && value !== autoFilledPrefix)
      setAutoFilledPrefix(null);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!validateContact(channel, contact)) {
      setContactError(contactErrorMessage(channel));
      return;
    }

    const country = COUNTRIES.find((c) => c.code === countryCode);

    startTransition(async () => {
      try {
        await submitInquiry(
          {
            paintingId,
            paintingTitle,
            paintingSlug,
            buyerName: name,
            buyerContact: contact.trim(),
            buyerCountry: country?.name ?? "",
            message: message || undefined,
          },
          channel,
        );
        router.push("/inquiry-received");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong");
      }
    });
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
              className={`px-3 py-1.5 text-sm border ${
                channel === c.name
                  ? "border-ink bg-ink text-canvas"
                  : "border-canvas-border text-ink-muted"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>
      </div>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Your name"
        required
        className="w-full border-b border-canvas-border py-2 text-sm focus:outline-none focus:border-ink"
      />

      <div>
        <input
          value={contact}
          onChange={(e) => handleContactChange(e.target.value)}
          placeholder={contactPlaceholder(channel)}
          required
          className="w-full border-b border-canvas-border py-2 text-sm focus:outline-none focus:border-ink"
        />
        {contactError && (
          <p className="text-xs text-red-600 mt-1">{contactError}</p>
        )}
      </div>

      <select
        value={countryCode}
        onChange={(e) => handleCountryChange(e.target.value)}
        required
        className="w-full border-b border-canvas-border py-2 text-sm bg-transparent focus:outline-none focus:border-ink"
      >
        <option value="" disabled>
          Select your country
        </option>
        {ZONES.map((zone) => (
          <optgroup key={zone} label={ZONE_LABELS[zone]}>
            {COUNTRIES.filter((c) => c.zone === zone).map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </optgroup>
        ))}
      </select>

      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Message (optional)"
        rows={3}
        className="w-full border-b border-canvas-border py-2 text-sm focus:outline-none focus:border-ink"
      />

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-ink text-canvas py-3 text-sm uppercase tracking-wide disabled:opacity-50"
      >
        {isPending ? "Sending…" : "Send inquiry"}
      </button>
    </form>
  );
}
