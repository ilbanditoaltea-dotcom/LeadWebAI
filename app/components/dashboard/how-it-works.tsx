import { Bot, MessageSquareCode, ScanSearch, Sparkles } from "lucide-react";
import { SectionCard } from "@/app/components/ui/section-card";

const steps = [
  {
    title: "Detecta negocios",
    description: "Busca empresas con oportunidad digital por sector y ubicación.",
    icon: ScanSearch,
  },
  {
    title: "Analiza la web",
    description: "Evalúa rendimiento, diseño, copy y conversiones de forma automática.",
    icon: Bot,
  },
  {
    title: "Genera demo",
    description: "Crea una propuesta visual personalizada en minutos.",
    icon: Sparkles,
  },
  {
    title: "Prepara mensaje",
    description: "Redacta outreach contextual para mejorar la tasa de respuesta.",
    icon: MessageSquareCode,
  },
];

export function HowItWorks() {
  return (
    <SectionCard
      title="Cómo funciona el agente"
      subtitle="Pipeline inteligente de prospección a cierre."
    >
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {steps.map((step, index) => {
          const Icon = step.icon;

          return (
            <article
              key={step.title}
              className="rounded-2xl border border-violet-100 bg-violet-50/60 p-4"
            >
              <div className="mb-3 inline-flex rounded-xl bg-white p-2 text-violet-700 shadow-sm">
                <Icon className="h-4 w-4" />
              </div>
              <p className="text-xs font-semibold uppercase tracking-wider text-violet-600">
                Paso {index + 1}
              </p>
              <h3 className="mt-1 font-semibold text-[#0f172a]">{step.title}</h3>
              <p className="mt-1 text-sm text-[#64748b]">{step.description}</p>
            </article>
          );
        })}
      </div>
      <p className="mt-4 text-xs text-[#64748b]">
        Flujo sugerido: detectar -&gt; analizar -&gt; crear demo -&gt; enviar mensaje -&gt; seguimiento -&gt; cierre.
      </p>
    </SectionCard>
  );
}
