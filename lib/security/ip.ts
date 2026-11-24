import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";

/** Client IP from forwarded headers. On Vercel the platform sets x-forwarded-for. */
export async function getClientIp(): Promise<string | null> {
  const h = await headers();
  const forwarded = h.get("x-forwarded-for")?.split(",")[0]?.trim();
  return forwarded || h.get("x-real-ip")?.trim() || null;
}

/** sha256(IP_HASH_SALT + ip). The raw IP is never stored. */
export function hashIp(ip: string | null): string | null {
  const salt = process.env.IP_HASH_SALT;
  if (!salt) throw new Error("IP_HASH_SALT is not configured");
  if (!ip) return null;
  return createHash("sha256").update(salt + ip).digest("hex");
}
