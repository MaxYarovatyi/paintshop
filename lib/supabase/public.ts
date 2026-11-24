import { createClient } from "@supabase/supabase-js";

/**
 * Anon client with no cookies and no session. Used by public pages, the sitemap and
 * robots, so they never depend on who is logged in. RLS decides what is visible:
 * works in a "coming" series are hidden from this client.
 */
export function createPublicClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } },
  );
}
