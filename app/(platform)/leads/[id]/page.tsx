import { SectionCard } from "@/app/components/ui/section-card";
import { AnalyzeWithAiButton } from "@/app/components/leads/analyze-with-ai-button";
import { GeneratedWebsiteSection } from "@/app/components/leads/generated-website-section";
import {
  GeneratedWebsiteVersions,
  type GeneratedWebsiteVersionView,
} from "@/app/components/leads/generated-website-versions";
import { SalesMessageSection } from "@/app/components/leads/sales-message-section";
import { ContactApprovalChecklist } from "@/app/components/leads/contact-approval-checklist";
import { BeforeAfterSalesBrief } from "@/app/components/leads/before-after-sales-brief";
import { OpportunityScore } from "@/app/components/ui/opportunity-score";
import { StatusBadge } from "@/app/components/ui/status-badge";
import { getDemoBusinessCaseByLeadId } from "@/app/lib/demo-business-cases";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import type { Database } from "@/src/lib/supabase/database.types";
import type { GeneratedWebsite, JsonValue } from "@/src/lib/types/ai-website";
import { generateCustomWebsiteOutputSchema } from "@/src/lib/ai/generate-custom-website";

type LeadDetailPageProps = {
  params: Promise<{ id: string }>;
};

type LeadRow = Database["public"]["Tables"]["leads"]["Row"];
type GeneratedWebsiteRow = Database["public"]["Tables"]["generated_websites"]["Row"];

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

async function getLeadById(id: string): Promise<LeadRow | null> {
  if (!isUuid(id)) {
    return null;
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.from("leads").select("*").eq("id", id).maybeSingle();
    if (error || !data) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

async function getGeneratedWebsiteForLead(
  leadId: string,
): Promise<{ row: GeneratedWebsiteRow | null; website: GeneratedWebsite | null }> {
  if (!isUuid(leadId)) {
    return { row: null, website: null };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("generated_websites")
      .select("*")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return { row: null, website: null };
    }

    const parsed = generateCustomWebsiteOutputSchema.safeParse({
      businessProfile: data.business_profile,
      website: data.website,
      seo: data.seo ?? { title: "", description: "", keywords: [] },
      contact: data.contact ?? {
        phone: "unknown",
        email: "unknown",
        whatsapp: "unknown",
        address: "unknown",
      },
      confidence: data.confidence ?? {
        reasoning: "unknown",
        salesAngle: "unknown",
        detectedProblems: [],
        recommendedFeatures: [],
      },
    });

    if (!parsed.success) {
      return { row: data, website: null };
    }

    return {
      row: data,
      website: {
        id: data.id,
        leadId: data.lead_id ?? "unknown",
        businessProfile: parsed.data.businessProfile,
        website: {
          hero: parsed.data.website.hero,
          sections: parsed.data.website.sections.map((section) => ({
            ...section,
            items: Array.isArray(section.items) ? (section.items as JsonValue[]) : [],
          })),
          seo: parsed.data.seo,
          contact: parsed.data.contact,
          confidence: parsed.data.confidence,
        },
      },
    };
  } catch {
    return { row: null, website: null };
  }
}

async function getGeneratedWebsiteVersions(
  generatedWebsiteId: string | null,
): Promise<GeneratedWebsiteVersionView[]> {
  if (!generatedWebsiteId) {
    return [];
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("generated_website_versions")
      .select("*")
      .eq("generated_website_id", generatedWebsiteId)
      .order("version_number", { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map((row) => ({
      id: row.id,
      versionNumber: row.version_number ?? 0,
      changeType: row.change_type ?? "manual",
      instruction: row.instruction ?? "Sin instrucción",
      createdAt: row.created_at
        ? new Date(row.created_at).toLocaleString("es-ES")
        : "Fecha desconocida",
    }));
  } catch {
    return [];
  }
}

async function getLatestMessageForLead(
  leadId: string,
): Promise<{
  channel: "email" | "whatsapp" | "instagram_dm" | "call_script" | null;
  subject: string;
  body: string;
}> {
  if (!isUuid(leadId)) {
    return { channel: null, subject: "", body: "" };
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("lead_id", leadId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      return { channel: null, subject: "", body: "" };
    }

    const safeChannel =
      data.channel === "email" ||
      data.channel === "whatsapp" ||
      data.channel === "instagram_dm" ||
      data.channel === "call_script"
        ? data.channel
        : null;

    return {
      channel: safeChannel,
      subject: data.subject ?? "",
      body: data.body ?? "",
    };
  } catch {
    return { channel: null, subject: "", body: "" };
  }
}

export default async function LeadDetailPage({ params }: LeadDetailPageProps) {
  const { id } = await params;
  const mockCase = getDemoBusinessCaseByLeadId(id);
  const dbLead = await getLeadById(id);
  const generatedWebsiteResult = await getGeneratedWebsiteForLead(id);
  const generatedWebsiteVersions = await getGeneratedWebsiteVersions(
    generatedWebsiteResult.row?.id ?? null,
  );
  const latestMessage = await getLatestMessageForLead(id);

  const businessName = dbLead?.business_name ?? mockCase?.businessName ?? `Lead ${id}`;
  const city = dbLead?.city ?? mockCase?.city ?? "unknown";
  const category = dbLead?.category ?? mockCase?.category ?? "generic";
  const description = dbLead?.description ?? mockCase?.description ?? "unknown";
  const websiteUrl = dbLead?.website_url ?? mockCase?.websiteUrl ?? "www.negocio-demo.es";
  const phone = dbLead?.phone ?? mockCase?.phone ?? "+34 600 123 456";
  const email = dbLead?.email ?? mockCase?.email ?? "info@negocio.es";
  const whatsapp = dbLead?.whatsapp ?? mockCase?.whatsapp ?? "+34 600 123 456";
  const address = dbLead?.address ?? mockCase?.address ?? "Dirección pendiente";
  const websiteScore = dbLead?.website_quality_score ?? mockCase?.websiteQualityScore ?? 64;
  const opportunityScore = dbLead?.opportunity_score ?? mockCase?.opportunityScore ?? 58;
  const mainProblem = dbLead?.main_problem_detected ?? mockCase?.mainProblemDetected ?? "Sin analisis todavia";
  const status = dbLead?.status ?? mockCase?.campaignStatus ?? "pending";
  const detectedProblems =
    Array.isArray(dbLead?.detected_problems) && dbLead?.detected_problems.every((item) => typeof item === "string")
      ? (dbLead?.detected_problems as string[])
      : mockCase?.detectedProblems ?? [];
  const recommendations =
    Array.isArray(dbLead?.recommendations) && dbLead?.recommendations.every((item) => typeof item === "string")
      ? (dbLead?.recommendations as string[])
      : mockCase?.recommendations ?? [];
  const generatedWebsite = generatedWebsiteResult.website ?? mockCase?.generatedWebsite ?? null;
  const generatedWebsiteId = generatedWebsiteResult.row?.id ?? null;
  const demoSlug = generatedWebsiteResult.row?.demo_slug ?? mockCase?.demoSlug ?? null;
  const latestMessageChannel = latestMessage.channel ?? mockCase?.suggestedMessage.channel ?? "email";
  const latestMessageSubject = latestMessage.subject || mockCase?.suggestedMessage.subject || "";
  const latestMessageBody = latestMessage.body || mockCase?.suggestedMessage.body || "";
  const demoUrl = demoSlug ? `/demo/${demoSlug}` : generatedWebsiteId ? `/demo/${generatedWebsiteId}` : null;
  const salesAngle =
    generatedWebsite?.website.confidence.salesAngle ??
    "Propuesta orientada a convertir visitas locales en reservas/contactos.";

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              Nuevo lead
            </div>
            <h2 className="text-2xl font-semibold tracking-tight text-slate-900">{businessName}</h2>
            <p className="text-sm text-slate-500">
              {city}, Espana - {category}
            </p>
            <div className="flex flex-wrap gap-4 text-sm text-slate-600">
              <span>{websiteUrl}</span>
              <span>{phone}</span>
              <span>{email}</span>
              <span>{whatsapp}</span>
            </div>
          </div>
          <OpportunityScore value={opportunityScore} />
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
        <SectionCard title="Analisis y comparacion web" subtitle="Situacion actual vs propuesta IA">
          <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-xl border border-slate-200 bg-slate-900 p-4 text-white">
              <p className="text-xs uppercase tracking-wide text-slate-300">Sitio actual</p>
              <h4 className="mt-2 text-lg font-semibold">{businessName}</h4>
              <p className="mt-2 text-sm text-slate-300">
                Web lenta, experiencia movil limitada y poca claridad comercial.
              </p>
            </article>
            <article className="rounded-xl border border-violet-200 bg-gradient-to-r from-violet-600 to-indigo-600 p-4 text-white">
              <p className="text-xs uppercase tracking-wide text-violet-100">Demo generada (propuesta)</p>
              <h4 className="mt-2 text-lg font-semibold">Nueva web de conversion</h4>
              <p className="mt-2 text-sm text-violet-100">
                Reservas visibles, WhatsApp integrado, diseno moderno y optimizado para movil.
              </p>
            </article>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <span className="font-semibold">Puntos clave detectados:</span> velocidad lenta, menu en PDF,
              problemas de conversion movil.
            </div>
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
              <span className="font-semibold">Mejora esperada:</span> +40% reservas, +25% conversion a contacto.
            </div>
          </div>
        </SectionCard>

        <div className="space-y-6">
          <SectionCard title="Auditoria del sitio actual" subtitle="Hallazgos principales">
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-2">Web lenta - 5.6s</li>
              <li className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                No tiene reservas online
              </li>
              <li className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2">
                Menu PDF poco usable
              </li>
              <li className="rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2">
                WhatsApp no visible
              </li>
              <li className="rounded-lg border border-violet-200 bg-violet-50 px-3 py-2">{mainProblem}</li>
            </ul>
          </SectionCard>

          <SectionCard title="Estado del lead" subtitle="Progreso actual">
            <p className="text-sm text-slate-600">
              Status: <StatusBadge label={status} tone="violet" className="ml-1" />
            </p>
            <p className="mt-2 text-sm text-slate-600">
              Website quality score: <span className="font-semibold text-slate-900">{websiteScore}/100</span>
            </p>
            <div className="mt-4">
              <AnalyzeWithAiButton
                payload={{
                  leadId: id,
                  businessName,
                  category,
                  city,
                  description,
                  websiteUrl: websiteUrl ?? undefined,
                  googleMapsUrl: dbLead?.google_maps_url ?? undefined,
                  instagramUrl: dbLead?.instagram_url ?? undefined,
                }}
              />
            </div>
          </SectionCard>
        </div>
      </div>

      <section className="grid gap-6 xl:grid-cols-2">
        <SectionCard title="Recomendaciones automaticas" subtitle="Acciones clave para mejorar conversión">
          <ul className="grid gap-3 text-sm text-slate-700">
            <li className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              Implementar reservas online con confirmacion automatica.
            </li>
            <li className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              Integrar WhatsApp Business en hero, menu y footer.
            </li>
            <li className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              SEO local orientado a &quot;restaurante en {city}&quot;.
            </li>
          </ul>
        </SectionCard>

        <SectionCard title="Propuesta de servicio mensual" subtitle="Plan recomendado">
          <div className="rounded-xl border border-violet-200 bg-violet-50 p-4">
            <p className="text-sm font-semibold text-violet-700">Plan Crecimiento</p>
            <p className="mt-1 text-3xl font-semibold text-slate-900">127 EUR/mes</p>
            <ul className="mt-3 space-y-2 text-sm text-slate-700">
              <li>Web profesional orientada a conversion</li>
              <li>Reservas online ilimitadas</li>
              <li>Menu digital + WhatsApp integrado</li>
              <li>SEO local + mantenimiento mensual</li>
            </ul>
          </div>
        </SectionCard>
      </section>

      <GeneratedWebsiteSection
        lead={{
          id,
          businessName,
          category,
          city,
          description,
          phone,
          email,
          whatsapp,
          address,
          websiteUrl,
          detectedProblems,
          recommendations,
        }}
        generatedWebsite={generatedWebsite}
        generatedWebsiteId={generatedWebsiteId}
        demoSlug={demoSlug}
        status={generatedWebsiteResult.row?.status ?? mockCase?.campaignStatus ?? null}
      />

      <BeforeAfterSalesBrief
        businessName={businessName}
        city={city}
        category={category}
        websiteUrl={websiteUrl}
        detectedProblems={detectedProblems}
        recommendations={recommendations}
        salesAngle={salesAngle}
        demoUrl={demoUrl}
      />

      <GeneratedWebsiteVersions versions={generatedWebsiteVersions} />

      <SalesMessageSection
        lead={{
          leadId: id,
          businessName,
          city,
          category,
          detectedProblems,
        }}
        generatedWebsite={{
          id: generatedWebsiteResult.row?.id ?? generatedWebsite?.id ?? null,
          demoSlug,
        }}
        initialChannel={latestMessageChannel}
        initialSubject={latestMessageSubject}
        initialBody={latestMessageBody}
      />

      <ContactApprovalChecklist leadId={id} currentStatus={status} />
    </div>
  );
}
