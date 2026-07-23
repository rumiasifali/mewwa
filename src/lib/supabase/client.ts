import { createBrowserClient } from "@supabase/ssr";
import { useMemo } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let client: any = null;

export function createClient() {
  if (client) return client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // During pre-rendering, env vars may not be available
    // Return a proxy that won't crash but won't work either
    return new Proxy({} as ReturnType<typeof createBrowserClient>, {
      get: () => () => Promise.resolve({ data: null, error: null }),
    });
  }

  client = createBrowserClient(supabaseUrl, supabaseKey);
  return client;
}

export function useSupabase() {
  return useMemo(() => createClient(), []);
}
