export function isValidHttpUrl(value: string | undefined) {
  if (!value) {
    return false;
  }

  if (value === "tu_url") {
    return false;
  }

  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function hasValidSupabaseEnv() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return Boolean(
    isValidHttpUrl(supabaseUrl) &&
      supabaseAnonKey &&
      supabaseAnonKey !== "tu_anon_key",
  );
}
