import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Server-only client using the secret key. It bypasses RLS, so every caller must
 * validate its input and check permissions itself. No session, no cookies.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) throw new Error("Supabase secret key is not configured");
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
