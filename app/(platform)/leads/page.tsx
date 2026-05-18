import { LeadsTable, type LeadTableRow } from "@/app/components/dashboard/leads-table";
import { SectionCard } from "@/app/components/ui/section-card";
import { recentLeads } from "@/app/lib/mock-data";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import type { Database } from "@/src/lib/supabase/database.types";

type LeadRow = Database["public"]["Tables"]["leads"]["Row"];

function mapStatusToDemoStatus(status: string | null): LeadTableRow["demoStatus"] {
  if (!status) {
    return "Pendiente";
  }

  if (status === "new" || status === "draft") {
    return "Pendiente";
  }

  if (status === "in_progress" || status === "analyzing") {
    return "En progreso";
  }

  return "Lista";
}

function mapOpportunityToPriority(score: number | null): LeadTableRow["priority"] {
  if (score === null) {
    return "Media";
  }

  if (score >= 80) {
    return "Alta";
  }

  if (score >= 55) {
    return "Media";
  }

  return "Baja";
}

function mapDbLeadToTableRow(lead: LeadRow): LeadTableRow {
  return {
    id: lead.id,
    company: lead.business_name,
    sector: lead.category ?? "General",
    city: lead.city ?? "Sin ciudad",
    websiteScore: lead.website_quality_score ?? 50,
    demoStatus: mapStatusToDemoStatus(lead.status),
    priority: mapOpportunityToPriority(lead.opportunity_score),
  };
}

function mapMockLeadToTableRow(): LeadTableRow[] {
  return recentLeads.map((lead) => ({
    id: lead.id,
    company: lead.company,
    sector: lead.sector,
    city: lead.city,
    websiteScore: lead.websiteScore,
    demoStatus: lead.demoStatus,
    priority: lead.priority,
  }));
}

async function getLeadsForTable(): Promise<{ leads: LeadTableRow[]; source: "supabase" | "mock" }> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20);

    if (error || !data || data.length === 0) {
      return { leads: mapMockLeadToTableRow(), source: "mock" };
    }

    return { leads: data.map(mapDbLeadToTableRow), source: "supabase" };
  } catch {
    return { leads: mapMockLeadToTableRow(), source: "mock" };
  }
}

export default async function LeadsPage() {
  const { leads, source } = await getLeadsForTable();
  const isMock = source === "mock";

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-violet-100 bg-gradient-to-r from-violet-600 to-fuchsia-600 p-6 text-white shadow-sm">
        <h2 className="text-2xl font-semibold tracking-tight">Leads inteligentes</h2>
        <p className="mt-2 text-sm text-violet-100">
          Conectado a Supabase para leer oportunidades reales y priorizarlas automáticamente.
        </p>
      </section>

      {isMock ? (
        <SectionCard
          title="Mostrando datos mock"
          subtitle="No se encontraron leads reales o faltan variables de Supabase."
        >
          <p className="text-sm text-slate-600">
            Inserta datos en la tabla <code>leads</code> para ver resultados reales aquí.
          </p>
        </SectionCard>
      ) : null}

      <LeadsTable leads={leads} />
    </div>
  );
}
