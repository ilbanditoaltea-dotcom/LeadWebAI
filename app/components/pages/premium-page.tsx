import { ArrowUpRight, Sparkles } from "lucide-react";
import { SectionCard } from "@/app/components/ui/section-card";
import type { Locale } from "@/app/lib/i18n";

type PremiumPageProps = {
  locale: Locale;
  title: string;
  description: string;
  metricLabel: string;
  metricValue: string;
  metricDelta: string;
  highlights: string[];
};

export function PremiumPage({
  locale,
  title,
  description,
  metricLabel,
  metricValue,
  metricDelta,
  highlights,
}: PremiumPageProps) {
  const uiText =
    locale === "en"
      ? {
          last7Days: "Last 7 days",
          suggestedActions: "Suggested actions",
          autoOptimizations: "Automated optimizations",
          moduleStatus: "Module status",
          liveMonitoring: "Real-time monitoring",
          operational: "Operational and scalable",
          operationalBody:
            "AI flow running with mock data and ready for live connection.",
          smartSummary: "Smart summary",
          smartSummarySubtitle: "Insights ready for the sales team",
        }
      : {
          last7Days: "Últimos 7 días",
          suggestedActions: "Acciones sugeridas",
          autoOptimizations: "Optimizaciones automáticas",
          moduleStatus: "Estado del módulo",
          liveMonitoring: "Monitoreo en tiempo real",
          operational: "Operativo y escalable",
          operationalBody:
            "Flujo de IA funcionando con datos mock y preparado para conexión real.",
          smartSummary: "Resumen inteligente",
          smartSummarySubtitle: "Insights listos para equipo comercial",
        };

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-violet-100 bg-gradient-to-r from-violet-600 to-fuchsia-600 p-6 text-white shadow-sm">
        <p className="text-sm text-violet-100">LeadWeb AI</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-2 max-w-2xl text-sm text-violet-100">{description}</p>
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <SectionCard
          title={metricLabel}
          subtitle={uiText.last7Days}
          action={
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              <ArrowUpRight className="h-3.5 w-3.5" />
              {metricDelta}
            </span>
          }
        >
          <p className="text-4xl font-semibold tracking-tight text-slate-900">{metricValue}</p>
        </SectionCard>

        <SectionCard title={uiText.suggestedActions} subtitle={uiText.autoOptimizations}>
          <ul className="space-y-3">
            {highlights.slice(0, 2).map((item) => (
              <li key={item} className="rounded-2xl border border-violet-100 bg-violet-50/60 p-3 text-sm text-slate-700">
                {item}
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title={uiText.moduleStatus} subtitle={uiText.liveMonitoring}>
          <div className="rounded-2xl border border-violet-100 bg-slate-50 p-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
              <Sparkles className="h-3.5 w-3.5" />
              {uiText.operational}
            </div>
            <p className="mt-3 text-sm text-slate-600">
              {uiText.operationalBody}
            </p>
          </div>
        </SectionCard>
      </div>

      <SectionCard title={uiText.smartSummary} subtitle={uiText.smartSummarySubtitle}>
        <div className="grid gap-3 md:grid-cols-3">
          {highlights.map((item) => (
            <article
              key={item}
              className="rounded-2xl border border-slate-100 bg-white p-4 text-sm text-slate-600"
            >
              {item}
            </article>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
