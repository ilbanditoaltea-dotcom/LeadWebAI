import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import {
  parsePlatformBrandSettings,
  platformBrandSettingsSchema,
} from "@/src/lib/settings/platform-brand";

const SETTINGS_KEY = "platform_brand";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("settings")
      .select("*")
      .eq("key", SETTINGS_KEY)
      .maybeSingle();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      key: SETTINGS_KEY,
      value: parsePlatformBrandSettings(data?.value),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const value = platformBrandSettingsSchema.parse(body);

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("settings").upsert(
      {
        key: SETTINGS_KEY,
        value,
      },
      { onConflict: "key" },
    );

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true, value });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
