"use client";
import { COUNTRIES, ShippingZone, ZONE_LABELS } from "@/lib/inquiries/countries";
import {
  CHANNEL_CONTACT_TYPE,
  contactPlaceholder,
  resolveContactMode,
} from "@/lib/inquiries/validation";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const ZONES: ShippingZone[] = ["ukraine", "europe", "usa"];

function Flag({ code }: { code: string }) {
  return (
    <span
      className={`fi fi-${code.toLowerCase()} text-base shrink-0`}
      aria-hidden="true"
    />
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`w-3.5 h-3.5 text-ink-muted shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 916 6 6-6" />
    </svg>
  );
}

export default function ContactFields({
  channel,
  value,
  onValueChange,
  countryCode,
  onCountryChange,
  error,
}: {
  channel: string;
  value: string;
  onValueChange: (value: string) => void;
  countryCode: string;
  onCountryChange: (value: string) => void;
  error: string | null;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const mode = resolveContactMode(channel, value);
  const country = COUNTRIES.find((c) => c.code === countryCode);
  const isPhoneOnly = CHANNEL_CONTACT_TYPE[channel] === "phone";

  useEffect(() => {
    if (!open) return;
    function handlePointerDown(e: MouseEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function handleKey(e: globalThis.KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative">
      {/* Contact row: [code selector, phone mode only] + input */}
      <div className="flex border-b border-canvas-border focus-within:border-ink">
        <AnimatePresence initial={false}>
          {mode === "phone" && (
            <motion.div
              key="code"
              className="overflow-hidden shrink-0"
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: "auto", opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-haspopup="listbox"
                aria-expanded={open}
                className="flex items-center gap-1.5 py-2 pr-3 text-sm whitespace-nowrap"
              >
                {country ? (
                  <>
                    <Flag code={country.code} />
                    <span>{country.dialCode}</span>
                  </>
                ) : (
                  <span className="text-ink-muted">Code</span>
                )}
                <Chevron open={open} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <input
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          placeholder={contactPlaceholder(channel)}
          inputMode={isPhoneOnly ? "tel" : "text"}
          required
          className="flex-1 min-w-0 bg-transparent py-2 text-sm focus:outline-none"
        />
      </div>

      {/* Country row: username mode only */}
      <AnimatePresence initial={false}>
        {mode === "username" && (
          <motion.div
            key="country"
            className="overflow-hidden"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="pt-4">
              <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-haspopup="listbox"
                aria-expanded={open}
                className="w-full flex items-center gap-2 border-b border-canvas-border py-2 text-sm text-left"
              >
                {country ? (
                  <>
                    <Flag code={country.code} />
                    <span>{country.name}</span>
                  </>
                ) : (
                  <span className="text-ink-muted">Select your country</span>
                )}
                <span className="ml-auto">
                  <Chevron open={open} />
                </span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}

      {/* One shared list, anchored under whichever trigger is currently visible */}
      {open && (
        <div
          role="listbox"
          className="absolute left-0 top-full mt-1 z-30 w-full max-h-64 overflow-y-auto bg-canvas border border-canvas-border shadow-sm"
        >
          {ZONES.map((zone) => (
            <div key={zone}>
              <p className="px-3 pt-3 pb-1 text-xs uppercase tracking-wide text-ink-muted">
                {ZONE_LABELS[zone]}
              </p>
              {COUNTRIES.filter((c) => c.zone === zone).map((c) => (
                <button
                  key={c.code}
                  type="button"
                  role="option"
                  aria-selected={c.code === countryCode}
                  onClick={() => {
                    onCountryChange(c.code);
                    setOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2 text-sm text-left hover:bg-canvas-muted ${
                    c.code === countryCode ? "bg-canvas-muted" : ""
                  }`}
                >
                  <Flag code={c.code} />
                  <span className="flex-1">{c.name}</span>
                  {mode === "phone" && (
                    <span className="text-ink-muted">{c.dialCode}</span>
                  )}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
