"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, RefreshCw, Save, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import type {
  GeneratedWebsite,
  WebsiteBusinessProfile,
  WebsiteSection,
} from "@/src/lib/types/ai-website";
import { SectionCard } from "@/app/components/ui/section-card";

type LeadContext = {
  id: string;
  businessName: string;
  category: string;
  city: string;
  description: string;
  phone: string;
  email: string;
  whatsapp: string;
  address: string;
  websiteUrl: string;
  detectedProblems: string[];
  recommendations: string[];
};

type GeneratedWebsiteSectionProps = {
  lead: LeadContext;
  generatedWebsite: GeneratedWebsite | null;
  generatedWebsiteId: string | null;
  demoSlug: string | null;
  status: string | null;
};

export function GeneratedWebsiteSection({
  lead,
  generatedWebsite,
  generatedWebsiteId,
  demoSlug,
  status,
}: GeneratedWebsiteSectionProps) {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const [heroTitle, setHeroTitle] = useState(generatedWebsite?.website.hero.title ?? "");
  const [heroSubtitle, setHeroSubtitle] = useState(generatedWebsite?.website.hero.subtitle ?? "");
  const [primaryCTA, setPrimaryCTA] = useState(generatedWebsite?.website.hero.primaryCTA ?? "");
  const [secondaryCTA, setSecondaryCTA] = useState(
    generatedWebsite?.website.hero.secondaryCTA ?? "",
  );
  const [sectionsJson, setSectionsJson] = useState(
    JSON.stringify(generatedWebsite?.website.sections ?? [], null, 2),
  );
  const [textsJson, setTextsJson] = useState(
    JSON.stringify(
      {
        salesAngle: generatedWebsite?.website.confidence.salesAngle ?? "",
        reasoning: generatedWebsite?.website.confidence.reasoning ?? "",
      },
      null,
      2,
    ),
  );
  const [colorPrimary, setColorPrimary] = useState(
    generatedWebsite?.businessProfile.colorPalette.primary ?? "#7c3aed",
  );
  const [colorSecondary, setColorSecondary] = useState(
    generatedWebsite?.businessProfile.colorPalette.secondary ?? "#a78bfa",
  );
  const [colorBackground, setColorBackground] = useState(
    generatedWebsite?.businessProfile.colorPalette.background ?? "#ffffff",
  );
  const [colorText, setColorText] = useState(
    generatedWebsite?.businessProfile.colorPalette.text ?? "#0f172a",
  );
  const [colorAccent, setColorAccent] = useState(
    generatedWebsite?.businessProfile.colorPalette.accent ?? "#f59e0b",
  );

  const demoUrl = demoSlug ? `/demo/${demoSlug}` : generatedWebsiteId ? `/demo/${generatedWebsiteId}` : null;

  const parsedSectionsCount = useMemo(() => {
    try {
      const parsed = JSON.parse(sectionsJson) as WebsiteSection[];
      return Array.isArray(parsed) ? parsed.length : 0;
    } catch {
      return 0;
    }
  }, [sectionsJson]);

  async function handleRegenerate() {
    try {
      setIsRegenerating(true);
      setFeedback(null);

      const response = await fetch("/api/intelligence/generate-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: lead.id,
          instruction: `Genera una web personalizada para ${lead.businessName} en ${lead.city}, evitando salida genérica.`,
        }),
      });

      const json = (await response.json()) as { error?: string; demoSlug?: string };
      if (!response.ok) {
        setFeedback(json.error ?? "No se pudo regenerar la web.");
        return;
      }

      setFeedback(
        json.demoSlug
          ? `Web regenerada correctamente. Demo: /demo/${json.demoSlug}`
          : "Web regenerada correctamente. Refresca la página para ver la nueva versión.",
      );
      router.refresh();
    } catch {
      setFeedback("Error inesperado al regenerar la web.");
    } finally {
      setIsRegenerating(false);
    }
  }

  async function handlePartialRegeneration(
    mode: "style" | "copy" | "sections" | "hero",
    defaultInstruction: string,
  ) {
    if (!generatedWebsite) {
      setFeedback("No existe una web generada para regenerar.");
      return;
    }

    const instruction =
      window.prompt("Instrucción para IA", defaultInstruction)?.trim() ||
      defaultInstruction;

    try {
      setIsRegenerating(true);
      setFeedback(null);

      const response = await fetch("/api/intelligence/regenerate-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: lead.id,
          instruction: `${instruction}. mode=${mode}.`,
        }),
      });

      const json = (await response.json()) as { error?: string; demoSlug?: string };
      if (!response.ok) {
        setFeedback(json.error ?? "No se pudo regenerar.");
        return;
      }

      setFeedback(
        json.demoSlug
          ? `Regeneración completada. Demo: /demo/${json.demoSlug}`
          : "Regeneración completada. Refrescando datos...",
      );
      router.refresh();
    } catch {
      setFeedback("Error inesperado en regeneración parcial.");
    } finally {
      setIsRegenerating(false);
    }
  }

  async function handleApprove() {
    if (!generatedWebsiteId) return;

    try {
      setIsApproving(true);
      setFeedback(null);

      const response = await fetch(`/api/generated-websites/${generatedWebsiteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });
      const json = (await response.json()) as { error?: string };

      if (!response.ok) {
        setFeedback(json.error ?? "No se pudo aprobar la demo.");
        return;
      }

      setFeedback("Demo aprobada correctamente.");
      router.refresh();
    } catch {
      setFeedback("Error inesperado al aprobar la demo.");
    } finally {
      setIsApproving(false);
    }
  }

  async function handleSaveJson() {
    if (!generatedWebsite || !generatedWebsiteId) return;

    try {
      setIsSaving(true);
      setFeedback(null);

      const parsedSections = JSON.parse(sectionsJson) as WebsiteSection[];
      const parsedTexts = JSON.parse(textsJson) as Record<string, unknown>;

      const updatedBusinessProfile: WebsiteBusinessProfile = {
        ...generatedWebsite.businessProfile,
        colorPalette: {
          primary: colorPrimary,
          secondary: colorSecondary,
          background: colorBackground,
          text: colorText,
          accent: colorAccent,
        },
      };

      const updatedWebsite = {
        ...generatedWebsite.website,
        hero: {
          ...generatedWebsite.website.hero,
          title: heroTitle,
          subtitle: heroSubtitle,
          primaryCTA,
          secondaryCTA,
        },
        sections: parsedSections,
        texts: parsedTexts,
      };

      const response = await fetch(`/api/generated-websites/${generatedWebsiteId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessProfile: updatedBusinessProfile,
          website: updatedWebsite,
          seo: generatedWebsite.website.seo,
          contact: generatedWebsite.website.contact,
          confidence: generatedWebsite.website.confidence,
        }),
      });

      const json = (await response.json()) as { error?: string };
      if (!response.ok) {
        setFeedback(json.error ?? "No se pudo guardar la edición.");
        return;
      }

      setFeedback("JSON guardado en Supabase.");
      setIsModalOpen(false);
    } catch {
      setFeedback("Error en formato JSON. Revisa secciones o textos.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <>
      <SectionCard
        title="Web personalizada generada"
        subtitle="Propuesta visual creada por IA para este lead."
      >
        {generatedWebsite ? (
          <div className="space-y-4">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="h-44 bg-gradient-to-r from-violet-700 via-indigo-700 to-violet-600 p-5 text-white">
                <p className="text-xs uppercase tracking-[0.2em] text-violet-100">Demo preview</p>
                <h3 className="mt-2 text-2xl font-semibold">
                  {generatedWebsite.website.hero.title}
                </h3>
                <p className="mt-2 max-w-xl text-sm text-violet-100">
                  {generatedWebsite.website.hero.subtitle}
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
              <article className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase text-slate-500">Tipo detectado</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {generatedWebsite.businessProfile.businessType}
                </p>
              </article>
              <article className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase text-slate-500">Estilo visual</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {generatedWebsite.businessProfile.visualStyle}
                </p>
              </article>
              <article className="rounded-xl border border-slate-200 bg-slate-50 p-3">
                <p className="text-xs font-semibold uppercase text-slate-500">Objetivo principal</p>
                <p className="mt-1 text-sm font-medium text-slate-900">
                  {generatedWebsite.businessProfile.mainGoal}
                </p>
              </article>
            </div>

            <article className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase text-slate-500">Secciones generadas</p>
              <p className="mt-1 text-sm text-slate-700">
                {generatedWebsite.website.sections
                  .sort((a, b) => a.order - b.order)
                  .map((section) => section.type)
                  .join(" - ")}
              </p>
            </article>

            <article className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase text-slate-500">URL publica</p>
              <p className="mt-1 text-sm font-medium text-violet-700">
                {demoUrl ?? "No disponible"}
              </p>
              <p className="mt-1 text-xs text-slate-500">Estado: {status ?? "draft"}</p>
            </article>

            <div className="flex flex-wrap gap-2">
              {demoUrl ? (
                <Link
                  href={demoUrl}
                  target="_blank"
                  className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white"
                >
                  Ver demo
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="rounded-xl bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-500"
                >
                  Ver demo
                </button>
              )}

              <button
                type="button"
                onClick={handleRegenerate}
                disabled={isRegenerating}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
              >
                {isRegenerating ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Regenerar web
              </button>

              <button
                type="button"
                onClick={() =>
                  handlePartialRegeneration(
                    "style",
                    "Hazlo mas premium y elegante",
                  )
                }
                disabled={isRegenerating}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Regenerar estilo
              </button>

              <button
                type="button"
                onClick={() =>
                  handlePartialRegeneration(
                    "copy",
                    "Haz el texto mas directo y comercial",
                  )
                }
                disabled={isRegenerating}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Regenerar textos
              </button>

              <button
                type="button"
                onClick={() =>
                  handlePartialRegeneration(
                    "sections",
                    "Añade mas enfoque en reservas y conversion",
                  )
                }
                disabled={isRegenerating}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Regenerar secciones
              </button>

              <button
                type="button"
                onClick={() =>
                  handlePartialRegeneration(
                    "hero",
                    "Cambia el hero a una propuesta mas minimalista",
                  )
                }
                disabled={isRegenerating}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Regenerar hero
              </button>

              <button
                type="button"
                onClick={() => setIsModalOpen(true)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Editar JSON
              </button>

              <button
                type="button"
                onClick={handleApprove}
                disabled={isApproving}
                className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700"
              >
                {isApproving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Aprobar demo
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-slate-600">
              Todavia no hay una web personalizada generada para este lead.
            </p>
            <button
              type="button"
              onClick={handleRegenerate}
              disabled={isRegenerating}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white"
            >
              {isRegenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Generar primera web
            </button>
          </div>
        )}

        {feedback ? <p className="mt-3 text-xs text-slate-600">{feedback}</p> : null}
      </SectionCard>

      {isModalOpen && generatedWebsite ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">Editar JSON</h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-lg border border-slate-200 px-3 py-1 text-sm text-slate-600"
              >
                Cerrar
              </button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase text-slate-500">Hero title</span>
                <input
                  value={heroTitle}
                  onChange={(event) => setHeroTitle(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase text-slate-500">Hero subtitle</span>
                <input
                  value={heroSubtitle}
                  onChange={(event) => setHeroSubtitle(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase text-slate-500">Primary CTA</span>
                <input
                  value={primaryCTA}
                  onChange={(event) => setPrimaryCTA(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase text-slate-500">Secondary CTA</span>
                <input
                  value={secondaryCTA}
                  onChange={(event) => setSecondaryCTA(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-5">
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase text-slate-500">Primary</span>
                <input
                  value={colorPrimary}
                  onChange={(event) => setColorPrimary(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase text-slate-500">Secondary</span>
                <input
                  value={colorSecondary}
                  onChange={(event) => setColorSecondary(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase text-slate-500">Background</span>
                <input
                  value={colorBackground}
                  onChange={(event) => setColorBackground(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase text-slate-500">Text</span>
                <input
                  value={colorText}
                  onChange={(event) => setColorText(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
              <label className="space-y-1">
                <span className="text-xs font-semibold uppercase text-slate-500">Accent</span>
                <input
                  value={colorAccent}
                  onChange={(event) => setColorAccent(event.target.value)}
                  className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
                />
              </label>
            </div>

            <label className="mt-4 block space-y-1">
              <span className="text-xs font-semibold uppercase text-slate-500">
                Secciones (JSON) - {parsedSectionsCount} items
              </span>
              <textarea
                value={sectionsJson}
                onChange={(event) => setSectionsJson(event.target.value)}
                rows={12}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-xs"
              />
            </label>

            <label className="mt-4 block space-y-1">
              <span className="text-xs font-semibold uppercase text-slate-500">
                Textos (JSON)
              </span>
              <textarea
                value={textsJson}
                onChange={(event) => setTextsJson(event.target.value)}
                rows={6}
                className="w-full rounded-xl border border-slate-200 px-3 py-2 font-mono text-xs"
              />
            </label>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveJson}
                disabled={isSaving}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white"
              >
                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Guardar cambios
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
