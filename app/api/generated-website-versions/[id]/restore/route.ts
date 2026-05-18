import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import { generateCustomWebsiteOutputSchema } from "@/src/lib/ai/generate-custom-website";
import type { Json } from "@/src/lib/supabase/database.types";

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const supabase = await createSupabaseServerClient();

    const { data: version, error: versionError } = await supabase
      .from("generated_website_versions")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (versionError || !version) {
      return NextResponse.json({ error: "Version not found." }, { status: 404 });
    }

    const snapshot = version.snapshot;
    const parsed = generateCustomWebsiteOutputSchema.safeParse(snapshot);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Version snapshot is invalid." },
        { status: 400 },
      );
    }

    if (!version.generated_website_id) {
      return NextResponse.json(
        { error: "Version is not linked to a generated website." },
        { status: 400 },
      );
    }

    const websiteJson = parsed.data.website as unknown as Json;
    const seoJson = parsed.data.seo as unknown as Json;
    const contactJson = parsed.data.contact as unknown as Json;
    const confidenceJson = parsed.data.confidence as unknown as Json;

    const { error: updateError } = await supabase
      .from("generated_websites")
      .update({
        business_profile: parsed.data.businessProfile,
        website: websiteJson,
        seo: seoJson,
        contact: contactJson,
        confidence: confidenceJson,
      })
      .eq("id", version.generated_website_id);

    if (updateError) {
      return NextResponse.json(
        { error: `Failed to restore version: ${updateError.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
