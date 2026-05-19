import { type CampaignLead } from "@/app/components/campaigns/campaigns-kanban";
import { CampaignKanban } from "@/app/components/campaigns/campaign-kanban";
import { AutopilotRunner } from "@/app/components/campaigns/autopilot-runner";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import { hasValidSupabaseEnv } from "@/src/lib/supabase/env";
import { demoBusinessCases } from "@/app/lib/demo-business-cases";
import type { Database } from "@/src/lib/supabase/database.types";

type LeadRow = Database["public"]["Tables"]["leads"]["Row"];
type GeneratedWebsiteRow = Database["public"]["Tables"]["generated_websites"]["Row"];

function normalizeStatus(status: string | null): CampaignLead["status"] {
  if (!status) return "new_lead";
  if (status === "new" || status === "new_lead") return "new_lead";
  if (status === "analyzed") return "analyzed";
  if (status === "website_generated") return "website_generated";
  if (status === "pending_approval") return "pending_approval";
  if (status === "approved") return "approved";
  if (status === "contacted") return "contacted";
  if (status === "responded") return "responded";
  if (status === "client" || status === "closed") return "client";
  return "new_lead";
}

function mapDbLeadsToCampaignLeads(
  leads: LeadRow[],
  generatedWebsites: GeneratedWebsiteRow[],
): CampaignLead[] {
  const leadIdsWithDemo = new Set(
    generatedWebsites.map((website) => website.lead_id).filter(Boolean),
  );

  return leads.map((lead) => ({
    id: lead.id,
    name: lead.business_name,
    city: lead.city ?? "Sin ciudad",
    category: lead.category ?? "General",
    score: lead.opportunity_score ?? 55,
    status: normalizeStatus(lead.status),
    hasEmail: Boolean(lead.email),
    hasPhone: Boolean(lead.phone),
    hasWhatsapp: Boolean(lead.whatsapp),
    hasInstagram: Boolean(lead.instagram_url),
    hasDemo: leadIdsWithDemo.has(lead.id),
  }));
}

function mapMockLeadsToCampaignLeads(): CampaignLead[] {
  return demoBusinessCases.map((item) => ({
    id: item.leadId,
    name: item.businessName,
    city: item.city,
    category: item.category,
    score: item.opportunityScore,
    status: item.campaignStatus,
    hasEmail: Boolean(item.email),
    hasPhone: Boolean(item.phone),
    hasWhatsapp: Boolean(item.whatsapp),
    hasInstagram: true,
    hasDemo: true,
  }));
}

async function getCampaignLeads() {
  if (!hasValidSupabaseEnv()) {
    return { leads: mapMockLeadsToCampaignLeads(), useSupabase: false };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const [{ data: leadsData, error: leadsError }, { data: websitesData }] =
      await Promise.all([
        supabase.from("leads").select("*").order("created_at", { ascending: false }).limit(80),
        supabase.from("generated_websites").select("*"),
      ]);

    if (leadsError || !leadsData) {
      return { leads: mapMockLeadsToCampaignLeads(), useSupabase: false };
    }

    if (leadsData.length === 0) {
      return { leads: [], useSupabase: true };
    }

    return {
      leads: mapDbLeadsToCampaignLeads(leadsData, websitesData ?? []),
      useSupabase: true,
    };
  } catch {
    return { leads: mapMockLeadsToCampaignLeads(), useSupabase: false };
  }
}

export default async function CampaignsPage() {
  const { leads, useSupabase } = await getCampaignLeads();
  return (
    <div className="space-y-6">
      <AutopilotRunner />
      <CampaignKanban initialLeads={leads} useSupabase={useSupabase} />
    </div>
  );
}
