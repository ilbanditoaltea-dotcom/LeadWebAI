import { AiGeneratorWorkbench } from "@/app/components/ai-generator/ai-generator-workbench";
import { demoBusinessCases } from "@/app/lib/demo-business-cases";
import { hasValidSupabaseEnv } from "@/src/lib/supabase/env";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import type { Database } from "@/src/lib/supabase/database.types";

type LeadRow = Database["public"]["Tables"]["leads"]["Row"];
type GeneratedWebsiteRow = Database["public"]["Tables"]["generated_websites"]["Row"];

type AiGeneratorLeadOption = {
  id: string;
  businessName: string;
  category: string;
  city: string;
  description: string;
  websiteUrl: string;
  phone: string;
  email: string;
  whatsapp: string;
  address: string;
  detectedProblems: string[];
  recommendations: string[];
  generatedWebsiteId: string | null;
  demoSlug: string | null;
};

function readTextArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((item): item is string => typeof item === "string");
}

function mapDbLeadToOption(
  lead: LeadRow,
  generatedWebsite: GeneratedWebsiteRow | null,
): AiGeneratorLeadOption {
  return {
    id: lead.id,
    businessName: lead.business_name,
    category: lead.category ?? "generic",
    city: lead.city ?? "Madrid",
    description: lead.description ?? "",
    websiteUrl: lead.website_url ?? "unknown",
    phone: lead.phone ?? "unknown",
    email: lead.email ?? "unknown",
    whatsapp: lead.whatsapp ?? lead.phone ?? "unknown",
    address: lead.address ?? "unknown",
    detectedProblems: readTextArray(lead.detected_problems),
    recommendations: readTextArray(lead.recommendations),
    generatedWebsiteId: generatedWebsite?.id ?? null,
    demoSlug: generatedWebsite?.demo_slug ?? null,
  };
}

function mapDemoLeadToOption(): AiGeneratorLeadOption[] {
  return demoBusinessCases.map((item) => ({
    id: item.leadId,
    businessName: item.businessName,
    category: item.category,
    city: item.city,
    description: item.description,
    websiteUrl: item.websiteUrl,
    phone: item.phone,
    email: item.email,
    whatsapp: item.whatsapp,
    address: item.address,
    detectedProblems: item.detectedProblems,
    recommendations: item.recommendations,
    generatedWebsiteId: null,
    demoSlug: item.demoSlug,
  }));
}

async function getAiGeneratorLeads(): Promise<AiGeneratorLeadOption[]> {
  if (!hasValidSupabaseEnv()) {
    return mapDemoLeadToOption();
  }

  try {
    const supabase = await createSupabaseServerClient();
    const [{ data: leadsData, error: leadsError }, { data: websitesData, error: websitesError }] =
      await Promise.all([
        supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(150),
        supabase
          .from("generated_websites")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(300),
      ]);

    if (leadsError || websitesError || !leadsData) {
      return mapDemoLeadToOption();
    }

    if (leadsData.length === 0) {
      return [];
    }

    const latestWebsiteByLeadId = new Map<string, GeneratedWebsiteRow>();
    for (const website of websitesData ?? []) {
      if (website.lead_id && !latestWebsiteByLeadId.has(website.lead_id)) {
        latestWebsiteByLeadId.set(website.lead_id, website);
      }
    }

    return leadsData.map((lead) =>
      mapDbLeadToOption(lead, latestWebsiteByLeadId.get(lead.id) ?? null),
    );
  } catch {
    return mapDemoLeadToOption();
  }
}

export default async function AiGeneratorPage() {
  const initialLeads = await getAiGeneratorLeads();
  return <AiGeneratorWorkbench initialLeads={initialLeads} />;
}
