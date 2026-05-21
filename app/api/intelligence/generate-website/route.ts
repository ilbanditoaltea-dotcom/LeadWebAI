import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import type { BusinessIntelligenceProfile } from "@/src/lib/lead-intelligence/schemas";
import { createBusinessProfileFromLead } from "@/src/lib/lead-intelligence/business-profile";
import { generateWebsiteFromBusinessProfile } from "@/src/lib/lead-intelligence/website-generator";

const inputSchema = z.object({
  leadId: z.string().uuid(),
  businessProfileId: z.string().uuid().optional(),
  instruction: z.string().optional(),
});

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = inputSchema.parse(body);
    const supabase = await createSupabaseServerClient();

    let profile: BusinessIntelligenceProfile | null = null;

    if (input.businessProfileId) {
      const { data } = await supabase
        .from("business_profiles")
        .select("profile")
        .eq("id", input.businessProfileId)
        .maybeSingle();
      profile = (data?.profile as BusinessIntelligenceProfile | null) ?? null;
    } else {
      const { data } = await supabase
        .from("business_profiles")
        .select("profile")
        .eq("lead_id", input.leadId)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      profile = (data?.profile as BusinessIntelligenceProfile | null) ?? null;
    }

    if (!profile) {
      const created = await createBusinessProfileFromLead({
        leadId: input.leadId,
        instruction: input.instruction,
      });
      profile = created.profile;
    }

    const result = await generateWebsiteFromBusinessProfile({
      leadId: input.leadId,
      profile,
      instruction: input.instruction,
    });

    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
