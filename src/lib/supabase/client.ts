import { createBrowserClient } from "@supabase/ssr";
import type { Database } from "@/src/lib/supabase/database.types";
import { hasValidSupabaseEnv } from "@/src/lib/supabase/env";

export function createSupabaseBrowserClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!hasValidSupabaseEnv() || !supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Missing or invalid Supabase env vars. Set real values for NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey);
}
