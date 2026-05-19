import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { SectionCard } from "@/app/components/ui/section-card";
import { demoBusinessCases } from "@/app/lib/demo-business-cases";
import { getServerLocale } from "@/app/lib/i18n-server";
import { hasValidSupabaseEnv } from "@/src/lib/supabase/env";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import type { Database } from "@/src/lib/supabase/database.types";

type LeadRow = Database["public"]["Tables"]["leads"]["Row"];
type GeneratedWebsiteRow = Database["public"]["Tables"]["generated_websites"]["Row"];

type DemoListItem = {
  id: string;
  leadId: string | null;
  demoSlug: string;
  businessName: string;
  city: string;
  category: string;
  status: string;
  createdAt: string | null;
};

async function getDemoItems(): Promise<DemoListItem[]> {
  if (!hasValidSupabaseEnv()) {
    return demoBusinessCases.map((item) => ({
      id: item.generatedWebsite.id,
      leadId: item.leadId,
      demoSlug: item.demoSlug,
      businessName: item.businessName,
      city: item.city,
      category: item.category,
      status: item.campaignStatus,
      createdAt: null,
    }));
  }

  try {
    const supabase = await createSupabaseServerClient();
    const [{ data: websitesData, error: websitesError }, { data: leadsData }] = await Promise.all([
      supabase
        .from("generated_websites")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200),
      supabase.from("leads").select("*").limit(500),
    ]);

    if (websitesError || !websitesData || websitesData.length === 0) {
      return demoBusinessCases.map((item) => ({
        id: item.generatedWebsite.id,
        leadId: item.leadId,
        demoSlug: item.demoSlug,
        businessName: item.businessName,
        city: item.city,
        category: item.category,
        status: item.campaignStatus,
        createdAt: null,
      }));
    }

    const leadsById = new Map<string, LeadRow>();
    for (const lead of (leadsData ?? []) as LeadRow[]) {
      leadsById.set(lead.id, lead);
    }

    return (websitesData as GeneratedWebsiteRow[]).map((website) => {
      const lead = website.lead_id ? leadsById.get(website.lead_id) : null;
      const businessProfile = website.business_profile as { businessName?: string; city?: string; category?: string } | null;
      return {
        id: website.id,
        leadId: website.lead_id ?? null,
        demoSlug: website.demo_slug ?? website.id,
        businessName:
          lead?.business_name ??
          businessProfile?.businessName ??
          "Business",
        city: lead?.city ?? businessProfile?.city ?? "Unknown city",
        category: lead?.category ?? businessProfile?.category ?? "generic",
        status: website.status ?? "draft",
        createdAt: website.created_at ?? null,
      };
    });
  } catch {
    return demoBusinessCases.map((item) => ({
      id: item.generatedWebsite.id,
      leadId: item.leadId,
      demoSlug: item.demoSlug,
      businessName: item.businessName,
      city: item.city,
      category: item.category,
      status: item.campaignStatus,
      createdAt: null,
    }));
  }
}

export default async function DemosPage() {
  const locale = await getServerLocale();
  const demos = await getDemoItems();
  const title = locale === "en" ? "Demos" : "Demos";
  const subtitle =
    locale === "en"
      ? "Repository of demos created by the agent with a focus on consultative selling and fast closing."
      : "Repositorio de demos creadas por el agente con foco en venta consultiva y cierre rápido.";
  const listTitle = locale === "en" ? "Created demos" : "Demos creadas";
  const listSubtitle =
    locale === "en"
      ? "All demos generated for discovered businesses."
      : "Todas las demos generadas para negocios encontrados.";
  const emptyText =
    locale === "en"
      ? "No demos have been generated yet. Run autopilot or generate one from AI Generator."
      : "Aún no hay demos generadas. Ejecuta autopilot o genera una desde AI Generator.";

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-violet-100 bg-gradient-to-r from-violet-600 to-fuchsia-600 p-6 text-white shadow-sm">
        <p className="text-sm text-violet-100">LeadWeb AI</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm text-violet-100">{subtitle}</p>
      </section>

      <SectionCard title={listTitle} subtitle={listSubtitle}>
        {demos.length === 0 ? (
          <p className="text-sm text-slate-600">{emptyText}</p>
        ) : (
          <div className="space-y-3">
            {demos.map((demo) => (
              <article
                key={demo.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <div>
                  <p className="text-sm font-semibold text-slate-900">{demo.businessName}</p>
                  <p className="text-xs text-slate-600">
                    {demo.city} - {demo.category} - {demo.status}
                  </p>
                  <p className="text-xs text-slate-500">
                    {demo.createdAt
                      ? new Date(demo.createdAt).toLocaleString(locale === "en" ? "en-US" : "es-ES")
                      : locale === "en"
                        ? "Demo data"
                        : "Dato demo"}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`/demo/${demo.demoSlug}`}
                    target="_blank"
                    className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-1.5 text-xs font-semibold text-white"
                  >
                    {locale === "en" ? "Open demo" : "Abrir demo"} <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                  {demo.leadId ? (
                    <Link
                      href={`/leads/${demo.leadId}`}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                    >
                      {locale === "en" ? "View lead" : "Ver lead"}
                    </Link>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
