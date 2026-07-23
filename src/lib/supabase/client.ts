import { createBrowserClient } from "@supabase/ssr";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://vomqbnoyrkziyqujaksv.supabase.co";
const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || "sb_publishable_74OWWqgaLTDwr1ENNvAv9Q_pXfJIOCh";

export function createClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_KEY);
}
