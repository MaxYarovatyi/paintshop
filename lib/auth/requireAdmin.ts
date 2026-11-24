import "server-only";
import { createClient } from "@/lib/supabase/server";

/**
 * Verifies the caller is a signed-in admin. Uses getUser() (validated against Auth,
 * not just the cookie) and the admins table. Returns the cookie client, whose RLS
 * policies (is_admin()) are the second line of defence.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("Unauthorized");

  const { data: admin } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!admin) throw new Error("Unauthorized");

  return { supabase, user };
}
