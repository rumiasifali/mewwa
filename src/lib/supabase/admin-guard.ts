import { createClient } from "@/lib/supabase/server";

/**
 * Server-side admin check: verifies the current session belongs to a
 * profile with role = 'admin'. Returns the user or null.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle();

  return profile?.role === "admin" ? user : null;
}
