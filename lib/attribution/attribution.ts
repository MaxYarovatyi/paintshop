// First-touch attribution: pure helpers shared by proxy.ts and the inquiry action.
// No imports, so the unit tests can load this file directly with Node.

export const ATTRIBUTION_COOKIE = "src";
export const ATTRIBUTION_MAX_AGE_S = 60 * 60 * 24 * 30; // 30 days

const MAX_LEN = 64;

/** Compact cookie payload: source, medium, campaign, landing path, referrer host, time (ms). */
export interface Attribution {
  s: string;
  m?: string;
  c?: string;
  l?: string;
  r?: string;
  t: number;
}

/**
 * Lowercase, spaces to hyphens, keep only [a-z0-9-_.], cut to 64 characters.
 * Returns undefined when nothing usable is left.
 */
export function sanitizeValue(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const clean = value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9\-_.]/g, "")
    .slice(0, MAX_LEN);
  return clean || undefined;
}

/** Same rules as sanitizeValue, but "/" is kept so the value stays a path. */
export function sanitizePath(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const clean = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\-_./]/g, "")
    .slice(0, MAX_LEN);
  return clean.startsWith("/") ? clean : undefined;
}

/** Host of an external referrer, or undefined when missing, invalid or the same site. */
export function externalReferrerHost(
  referer: string | null | undefined,
  ownHost: string | null | undefined,
): string | undefined {
  if (!referer) return undefined;
  let host: string;
  try {
    host = new URL(referer).host.toLowerCase();
  } catch {
    return undefined;
  }
  const own = (ownHost ?? "").toLowerCase();
  if (!host || host === own) return undefined;
  return sanitizeValue(host);
}

/** Builds the first-touch record from a landing request. Null when there is no usable utm_source. */
export function buildAttribution(input: {
  searchParams: URLSearchParams;
  pathname: string;
  referer?: string | null;
  host?: string | null;
  now?: number;
}): Attribution | null {
  const s = sanitizeValue(input.searchParams.get("utm_source"));
  if (!s) return null;
  const a: Attribution = { s, t: input.now ?? Date.now() };
  const m = sanitizeValue(input.searchParams.get("utm_medium"));
  const c = sanitizeValue(input.searchParams.get("utm_campaign"));
  const l = sanitizePath(input.pathname);
  const r = externalReferrerHost(input.referer, input.host);
  if (m) a.m = m;
  if (c) a.c = c;
  if (l) a.l = l;
  if (r) a.r = r;
  return a;
}

export function serializeAttribution(a: Attribution): string {
  return JSON.stringify(a);
}

/**
 * Parses and re-validates a cookie value. Everything is sanitized again, because the
 * cookie comes back from the browser. Returns null for anything malformed.
 */
export function parseAttribution(raw: string | null | undefined): Attribution | null {
  if (!raw) return null;
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch {
    try {
      data = JSON.parse(decodeURIComponent(raw));
    } catch {
      return null;
    }
  }
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  const o = data as Record<string, unknown>;

  const s = sanitizeValue(o.s);
  const t = typeof o.t === "number" && Number.isFinite(o.t) && o.t > 0 ? Math.floor(o.t) : null;
  if (!s || t === null) return null;

  const a: Attribution = { s, t };
  const m = sanitizeValue(o.m);
  const c = sanitizeValue(o.c);
  const l = sanitizePath(o.l);
  const r = sanitizeValue(o.r);
  if (m) a.m = m;
  if (c) a.c = c;
  if (l) a.l = l;
  if (r) a.r = r;
  return a;
}

/** Shape stored in inquiries.utm. */
export function toUtmRecord(a: Attribution) {
  return {
    source: a.s,
    medium: a.m ?? null,
    campaign: a.c ?? null,
    landing_path: a.l ?? null,
    referrer_host: a.r ?? null,
    first_seen_at: new Date(a.t).toISOString(),
  };
}

/** "instagram / bio", "instagram", or "site". */
export function formatSource(source: string | null | undefined, medium?: string | null): string {
  if (!source) return "site";
  return medium ? `${source} / ${medium}` : source;
}
