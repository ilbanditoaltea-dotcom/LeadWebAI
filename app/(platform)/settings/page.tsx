import { PlatformBrandSettingsForm } from "@/app/components/settings/platform-brand-settings-form";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import { hasValidSupabaseEnv } from "@/src/lib/supabase/env";
import {
  defaultPlatformBrandSettings,
  parsePlatformBrandSettings,
} from "@/src/lib/settings/platform-brand";

async function getInitialSettings() {
  if (!hasValidSupabaseEnv()) {
    return defaultPlatformBrandSettings;
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .eq("key", "platform_brand")
      .maybeSingle();

    if (error || !data) {
      return defaultPlatformBrandSettings;
    }

    return parsePlatformBrandSettings(data.value);
  } catch {
    return defaultPlatformBrandSettings;
  }
}

export default async function SettingsPage() {
  const initialValue = await getInitialSettings();
  return <PlatformBrandSettingsForm initialValue={initialValue} />;
}
