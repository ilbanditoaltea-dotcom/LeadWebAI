import { SectionCard } from "@/app/components/ui/section-card";

type DemoDetailPageProps = {
  params: Promise<{ id: string }>;
};

export default async function DemoDetailPage({ params }: DemoDetailPageProps) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-violet-100 bg-gradient-to-r from-violet-600 to-fuchsia-600 p-6 text-white shadow-sm">
        <p className="text-sm text-violet-100">Demo ID</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">{id}</h2>
        <p className="mt-2 text-sm text-violet-100">
          Vista de revisión mock con módulos y propuesta comercial asociada.
        </p>
      </section>

      <div className="grid gap-6 xl:grid-cols-3">
        <SectionCard title="Estado" subtitle="Calidad visual">
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
            Lista para envío
          </span>
          <p className="mt-3 text-sm text-slate-600">
            Validada para outreach con CTA de demostración en vivo.
          </p>
        </SectionCard>

        <SectionCard title="Conversión estimada" subtitle="Modelo predictivo">
          <p className="text-4xl font-semibold text-slate-900">32%</p>
          <p className="mt-2 text-sm text-slate-600">
            Basado en señales de sector, urgencia y calidad del mensaje.
          </p>
        </SectionCard>

        <SectionCard title="Próximo paso" subtitle="Automatización">
          <p className="text-sm text-slate-700">
            Agendar envío en campaña de alto impacto para mañana a las 10:00.
          </p>
        </SectionCard>
      </div>
    </div>
  );
}
