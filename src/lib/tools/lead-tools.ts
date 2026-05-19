import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import type { Json } from "@/src/lib/supabase/database.types";
import type {
  AgentAnalyzeBusinessOutput,
  AgentGenerateMessageOutput,
  AgentGenerateWebsiteInput,
  AgentGenerateWebsiteOutput,
  AgentRegenerateWebsiteOutput,
} from "@/src/lib/agent/types";

function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function buildUniqueDemoSlug(baseName: string) {
  const supabase = await createSupabaseServerClient();
  const baseSlug = slugify(baseName) || "demo";
  const { data } = await supabase
    .from("generated_websites")
    .select("demo_slug")
    .ilike("demo_slug", `${baseSlug}%`);
  if (!data || data.length === 0) return baseSlug;
  return `${baseSlug}-${Date.now().toString(36).slice(-4)}`;
}

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

export async function ensureLeadForWebsiteGeneration(
  input: AgentGenerateWebsiteInput,
): Promise<string> {
  const supabase = await createSupabaseServerClient();

  if (isUuid(input.leadId)) {
    const { data, error } = await supabase
      .from("leads")
      .select("id")
      .eq("id", input.leadId)
      .maybeSingle();
    if (!error && data?.id) {
      return data.id;
    }
  }

  const { data: inserted, error: insertError } = await supabase
    .from("leads")
    .insert({
      business_name: input.businessName,
      category: input.category ?? "generic",
      city: input.city ?? "unknown",
      description: input.description ?? "Lead created from AI generator.",
      address: input.address ?? "unknown",
      phone: input.phone ?? "unknown",
      email: input.email ?? "unknown",
      whatsapp: input.whatsapp ?? "unknown",
      website_url: input.websiteUrl ?? "unknown",
      status: "analyzed",
      detected_problems: (input.detectedProblems ?? []) as unknown as Json,
      recommendations: (input.recommendations ?? []) as unknown as Json,
    })
    .select("id")
    .maybeSingle();

  if (insertError || !inserted?.id) {
    throw new Error(insertError?.message ?? "Failed to create lead for website generation");
  }

  return inserted.id;
}

export async function getLeadById(leadId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.from("leads").select("*").eq("id", leadId).maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}

export async function updateLeadAnalysis(leadId: string, analysis: AgentAnalyzeBusinessOutput) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("leads")
    .update({
      opportunity_score: analysis.opportunityScore,
      website_quality_score: analysis.websiteQualityScore,
      detected_problems: analysis.detectedProblems as unknown as Json,
      recommendations: analysis.recommendations as unknown as Json,
      main_problem_detected: analysis.detectedProblems[0] ?? "unknown",
      status: "analyzed",
    })
    .eq("id", leadId);
  if (error) throw new Error(error.message);
}

export async function createGeneratedWebsite(
  leadId: string,
  websiteJson: AgentGenerateWebsiteOutput,
) {
  const supabase = await createSupabaseServerClient();
  const demoSlug = await buildUniqueDemoSlug(websiteJson.businessProfile.businessName);

  const { data, error } = await supabase
    .from("generated_websites")
    .insert({
      lead_id: leadId,
      business_profile: websiteJson.businessProfile as unknown as Json,
      website: websiteJson.website as unknown as Json,
      seo: websiteJson.seo as unknown as Json,
      contact: websiteJson.contact as unknown as Json,
      confidence: websiteJson.confidence as unknown as Json,
      demo_slug: demoSlug,
      status: "draft",
    })
    .select("*")
    .maybeSingle();
  if (error || !data) throw new Error(error?.message ?? "Failed to create generated website");

  await createActivity(leadId, {
    type: "agent_generate_website",
    description: "Generated website proposal created.",
    metadata: { generatedWebsiteId: data.id, demoSlug },
  });

  return data;
}

export async function updateGeneratedWebsite(
  generatedWebsiteId: string,
  websiteJson: AgentRegenerateWebsiteOutput,
) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from("generated_websites")
    .update({
      business_profile: websiteJson.businessProfile as unknown as Json,
      website: websiteJson.website as unknown as Json,
      seo: websiteJson.seo as unknown as Json,
      contact: websiteJson.contact as unknown as Json,
      confidence: websiteJson.confidence as unknown as Json,
      status: "draft",
    })
    .eq("id", generatedWebsiteId);
  if (error) throw new Error(error.message);
}

export async function createSalesMessage(
  leadId: string,
  generatedWebsiteId: string | null,
  message: AgentGenerateMessageOutput,
) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("messages")
    .insert({
      lead_id: leadId,
      generated_website_id: generatedWebsiteId,
      channel: message.channel,
      subject: message.subject,
      body: message.body,
      status: "draft",
    })
    .select("*")
    .maybeSingle();
  if (error || !data) throw new Error(error?.message ?? "Failed to create message");
  return data;
}

export async function createActivity(
  leadId: string,
  activity: {
    type: string;
    description: string;
    metadata?: Record<string, unknown>;
  },
) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.from("activities").insert({
    lead_id: leadId,
    type: activity.type,
    description: activity.description,
    metadata: (activity.metadata ?? {}) as unknown as Json,
  });
  if (error) throw new Error(error.message);
}

export async function getLatestGeneratedWebsiteForLead(leadId: string) {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("generated_websites")
    .select("*")
    .eq("lead_id", leadId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data;
}
