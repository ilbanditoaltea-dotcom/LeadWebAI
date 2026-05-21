import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import { enrichPlaceById } from "@/src/lib/discovery/discovery-service";
import { researchWebsite } from "@/src/lib/research/website-research-service";
import { createBusinessProfileFromLead } from "@/src/lib/lead-intelligence/business-profile";
import { generateWebsiteFromBusinessProfile } from "@/src/lib/lead-intelligence/website-generator";

function readPlaceIdFromDescription(description: string | null) {
  const match = (description ?? "").match(/place_id=([^\s]+)/i);
  return match?.[1] ?? null;
}

export async function runFullPipeline(params: { leadId: string; instruction?: string }) {
  const supabase = await createSupabaseServerClient();
  const { data: lead } = await supabase
    .from("leads")
    .select("*")
    .eq("id", params.leadId)
    .maybeSingle();
  if (!lead) {
    throw new Error("Lead not found.");
  }

  const placeId = readPlaceIdFromDescription(lead.description);
  const enrichResult = placeId
    ? await enrichPlaceById({ placeId, leadId: params.leadId })
    : null;

  const finalWebsiteUrl = enrichResult?.enriched.websiteUrl ?? lead.website_url ?? null;
  const websiteResearch =
    finalWebsiteUrl && finalWebsiteUrl !== "unknown"
      ? await researchWebsite({
          leadId: params.leadId,
          websiteUrl: finalWebsiteUrl,
        })
      : null;

  const businessProfileResult = await createBusinessProfileFromLead({
    leadId: params.leadId,
    instruction: params.instruction,
  });

  const websiteResult = await generateWebsiteFromBusinessProfile({
    leadId: params.leadId,
    profile: businessProfileResult.profile,
    instruction: params.instruction,
  });

  return {
    leadId: params.leadId,
    enrich: enrichResult,
    websiteResearch,
    businessProfile: businessProfileResult.profile,
    generatedWebsite: websiteResult.website,
    generatedWebsiteId: websiteResult.generatedWebsite.id,
    demoSlug: websiteResult.demoSlug,
  };
}
