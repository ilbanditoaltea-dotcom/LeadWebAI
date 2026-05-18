import { ArrowUpRight, Sparkles } from "lucide-react";
import { SectionCard } from "@/app/components/ui/section-card";

type PremiumPageProps = {
  title: string;
  description: string;
  metricLabel: string;
  metricValue: string;
  metricDelta: string;
  highlights: string[];
};

export function PremiumPage({
  title,
  description,
  metricLabel,
  metricValue,
  metricDelta,
  highlights,
}: PremiumPageProps) {
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
          subtitle="Últimos 7 días"
          action={
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-700">
              <ArrowUpRight className="h-3.5 w-3.5" />
              {metricDelta}
            </span>
          }
        >
          <p className="text-4xl font-semibold tracking-tight text-slate-900">{metricValue}</p>
        </SectionCard>

        <SectionCard title="Acciones sugeridas" subtitle="Optimizaciones automáticas">
          <ul className="space-y-3">
            {highlights.slice(0, 2).map((item) => (
              <li key={item} className="rounded-2xl border border-violet-100 bg-violet-50/60 p-3 text-sm text-slate-700">
                {item}
              </li>
            ))}
          </ul>
        </SectionCard>

        <SectionCard title="Estado del módulo" subtitle="Monitoreo en tiempo real">
          <div className="rounded-2xl border border-violet-100 bg-slate-50 p-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
              <Sparkles className="h-3.5 w-3.5" />
              Operativo y escalable
            </div>
            <p className="mt-3 text-sm text-slate-600">
              Flujo de IA funcionando con datos mock y preparado para conexión real.
            </p>
          </div>
        </SectionCard>
      </div>

      <SectionCard title="Resumen inteligente" subtitle="Insights listos para equipo comercial">
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
