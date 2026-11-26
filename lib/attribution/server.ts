import "server-only";
import { cookies, headers } from "next/headers";
import {
  ATTRIBUTION_COOKIE,
  externalReferrerHost,
  parseAttribution,
  toUtmRecord,
} from "./attribution";

export interface InquiryAttribution {
  /** Value for inquiries.source. */
  source: string;
  /** Medium for display. Null when unknown. */
  medium: string | null;
  /** Value for inquiries.utm. Null without a first-touch cookie. */
  utm: ReturnType<typeof toUtmRecord> | null;
  /** Values for the existing inquiries.referrer and inquiries.landing_path columns. */
  referrer: string | null;
  landingPath: string | null;
}

const DEFAULT: InquiryAttribution = {
  source: "site",
  medium: null,
  utm: null,
  referrer: null,
  landingPath: null,
};

let warned = false;

/**
 * Where the visitor first came from, read only from the server-set cookie and request
 * headers. Never throws: any problem falls back to the default, so an inquiry is never
 * blocked by attribution.
 */
export async function getInquiryAttribution(): Promise<InquiryAttribution> {
  try {
    const store = await cookies();
    const raw = store.get(ATTRIBUTION_COOKIE)?.value;
    const a = parseAttribution(raw);
    if (a) {
      return {
        source: a.s,
        medium: a.m ?? null,
        utm: toUtmRecord(a),
        referrer: a.r ?? null,
        landingPath: a.l ?? null,
      };
    }
    if (raw && !warned) {
      warned = true;
      console.warn("Attribution cookie could not be parsed; using the default source.");
    }

    const h = await headers();
    const host = externalReferrerHost(h.get("referer"), h.get("host"));
    return host ? { ...DEFAULT, source: host, referrer: host } : DEFAULT;
  } catch (err) {
    if (!warned) {
      warned = true;
      console.warn("Attribution lookup failed:", err instanceof Error ? err.message : err);
    }
    return DEFAULT;
  }
}
