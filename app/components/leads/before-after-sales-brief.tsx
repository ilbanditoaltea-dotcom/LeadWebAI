"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, Copy } from "lucide-react";
import { SectionCard } from "@/app/components/ui/section-card";

type BeforeAfterSalesBriefProps = {
  businessName: string;
  city: string;
  category: string;
  websiteUrl: string;
  detectedProblems: string[];
  recommendations: string[];
  salesAngle: string;
  demoUrl: string | null;
};

function cleanList(values: string[], fallback: string[]) {
  const filtered = values
    .map((value) => value.trim())
    .filter((value) => value.length > 0)
    .slice(0, 6);
  return filtered.length > 0 ? filtered : fallback;
}

export function BeforeAfterSalesBrief({
  businessName,
  city,
  category,
  websiteUrl,
  detectedProblems,
  recommendations,
  salesAngle,
  demoUrl,
}: BeforeAfterSalesBriefProps) {
  const [copyFeedback, setCopyFeedback] = useState<"idle" | "copied" | "error">("idle");

  const beforeItems = useMemo(
    () =>
      cleanList(detectedProblems, [
        "Mensaje principal poco claro para clientes nuevos.",
        "CTA principal no visible en móvil.",
        "Estructura con fricción para convertir visitas en reservas/contacto.",
      ]),
    [detectedProblems],
  );

  const afterItems = useMemo(
    () =>
      cleanList(recommendations, [
        "Hero orientado a conversión con CTA inmediato.",
        "Bloques de confianza y prueba social en primera pantalla.",
        "Flujo optimizado para móvil y contacto rápido.",
      ]),
    [recommendations],
  );

  const briefText = useMemo(() => {
    const intro = `Hola equipo de ${businessName}, hemos analizado vuestra presencia digital en ${city} (${category}).`;
    const before = `Puntos de mejora detectados: ${beforeItems.slice(0, 3).join("; ")}.`;
    const after = `Propuesta de demo: ${afterItems.slice(0, 3).join("; ")}.`;
    const angle = salesAngle
      ? `Enfoque comercial: ${salesAngle}.`
      : "Enfoque comercial: aumentar conversion de visitas en oportunidades reales.";
    const link = demoUrl ? `Demo personalizada: ${demoUrl}.` : "";
    return [intro, before, after, angle, link].filter(Boolean).join(" ");
  }, [afterItems, beforeItems, businessName, category, city, demoUrl, salesAngle]);

  async function handleCopyBrief() {
    try {
      await navigator.clipboard.writeText(briefText);
      setCopyFeedback("copied");
      setTimeout(() => setCopyFeedback("idle"), 1800);
    } catch {
      setCopyFeedback("error");
      setTimeout(() => setCopyFeedback("idle"), 1800);
    }
  }

  return (
    <SectionCard
      title="Antes vs Despues (argumento comercial)"
      subtitle="Comparativa automatica lista para presentar al negocio."
      action={
        <button
          type="button"
          onClick={handleCopyBrief}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
        >
          <Copy className="h-4 w-4" />
          Copiar propuesta
        </button>
      }
    >
      <div className="grid gap-4 md:grid-cols-2">
        <article className="rounded-xl border border-rose-200 bg-rose-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-rose-700">Antes (web actual)</p>
          <p className="mt-2 text-xs text-rose-700">{websiteUrl}</p>
          <ul className="mt-3 space-y-2 text-sm text-rose-900">
            {beforeItems.slice(0, 4).map((item) => (
              <li key={item} className="rounded-lg border border-rose-200 bg-white px-3 py-2">
                {item}
              </li>
            ))}
          </ul>
        </article>

        <article className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
            Despues (demo propuesta)
          </p>
          <p className="mt-2 text-xs text-emerald-700">{demoUrl ?? "Genera la demo para ver URL publica."}</p>
          <ul className="mt-3 space-y-2 text-sm text-emerald-900">
            {afterItems.slice(0, 4).map((item) => (
              <li
                key={item}
                className="inline-flex w-full items-start gap-2 rounded-lg border border-emerald-200 bg-white px-3 py-2"
              >
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>
      </div>

      <article className="mt-4 rounded-xl border border-violet-200 bg-violet-50 p-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">
          Mensaje listo para enviar
        </p>
        <p className="mt-2 text-sm text-violet-900">{briefText}</p>
        {copyFeedback === "copied" ? (
          <p className="mt-2 text-xs font-semibold text-emerald-700">Copiado al portapapeles.</p>
        ) : null}
        {copyFeedback === "error" ? (
          <p className="mt-2 text-xs font-semibold text-rose-700">No se pudo copiar automáticamente.</p>
        ) : null}
      </article>
    </SectionCard>
  );
}
