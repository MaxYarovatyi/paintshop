import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";

const MIN_FILL_MS = 3000;
const MAX_AGE_MS = 2 * 60 * 60 * 1000;

function sign(ts: string): string {
  const secret = process.env.FORM_SIGNING_SECRET;
  if (!secret) throw new Error("FORM_SIGNING_SECRET is not configured");
  return createHmac("sha256", secret).update(ts).digest("hex");
}

/** Token issued when the form is shown: "<timestamp>.<hmac>". */
export function issueFormToken(): string {
  const ts = String(Date.now());
  return `${ts}.${sign(ts)}`;
}

/** True when the token is genuine, at least 3 s old and not expired. */
export function isFormTokenValid(token: unknown): boolean {
  if (typeof token !== "string") return false;
  const [ts, mac] = token.split(".");
  if (!ts || !mac || !/^\d{10,15}$/.test(ts)) return false;
  const expected = Buffer.from(sign(ts));
  const given = Buffer.from(mac);
  if (expected.length !== given.length || !timingSafeEqual(expected, given)) return false;
  const age = Date.now() - Number(ts);
  return age >= MIN_FILL_MS && age <= MAX_AGE_MS;
}
