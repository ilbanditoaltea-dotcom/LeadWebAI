import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import type { Json } from "@/src/lib/supabase/database.types";
import { createBusinessProfileFromLead } from "@/src/lib/lead-intelligence/business-profile";
import { generateWebsiteFromBusinessProfile } from "@/src/lib/lead-intelligence/website-generator";

const inputSchema = z.object({
  leadId: z.string().uuid(),
  instruction: z.string().min(3),
});

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = inputSchema.parse(body);
    const supabase = await createSupabaseServerClient();
    const profileResult = await createBusinessProfileFromLead({
      leadId: input.leadId,
      instruction: input.instruction,
    });
    const generated = await generateWebsiteFromBusinessProfile({
      leadId: input.leadId,
      profile: profileResult.profile,
      instruction: input.instruction,
    });
    await supabase.from("generated_website_versions").insert({
      generated_website_id: generated.generatedWebsite.id,
      version_number: 1,
      change_type: "regenerate",
      instruction: input.instruction,
      snapshot: generated.website as unknown as Json,
    });
    return NextResponse.json(generated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
