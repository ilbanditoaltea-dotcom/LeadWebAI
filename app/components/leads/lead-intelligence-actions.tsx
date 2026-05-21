"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Loader2 } from "lucide-react";

type LeadIntelligenceActionsProps = {
  leadId: string;
  placeId?: string | null;
  demoSlug?: string | null;
};

export function LeadIntelligenceActions({
  leadId,
  placeId,
  demoSlug,
}: LeadIntelligenceActionsProps) {
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [instruction, setInstruction] = useState("hazla más premium y menos genérica");

  const demoUrl = useMemo(() => (demoSlug ? `/demo/${demoSlug}` : null), [demoSlug]);

  async function runAction(action: string, body: Record<string, unknown>) {
    try {
      setLoadingAction(action);
      setFeedback(null);
      const response = await fetch(action, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = (await response.json()) as { error?: string; demoSlug?: string };
      if (!response.ok) {
        setFeedback(json.error ?? "Acción fallida.");
        return;
      }
      setFeedback(
        json.demoSlug
          ? `OK. Demo: /demo/${json.demoSlug}`
          : "Acción completada correctamente.",
      );
    } catch {
      setFeedback("Error inesperado ejecutando acción.");
    } finally {
      setLoadingAction(null);
    }
  }

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        Inteligencia del Lead
      </p>
      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
        <button
          type="button"
          onClick={() =>
            placeId
              ? runAction("/api/discovery/enrich-place", { placeId, leadId })
              : setFeedback("No hay place_id detectado en este lead.")
          }
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
          disabled={Boolean(loadingAction)}
        >
          {loadingAction === "/api/discovery/enrich-place" ? "Enriqueciendo..." : "Buscar/enriquecer datos"}
        </button>
        <button
          type="button"
          onClick={() => runAction("/api/research/website", { leadId })}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
          disabled={Boolean(loadingAction)}
        >
          {loadingAction === "/api/research/website" ? "Investigando..." : "Investigar web"}
        </button>
        <button
          type="button"
          onClick={() => runAction("/api/intelligence/business-profile", { leadId })}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
          disabled={Boolean(loadingAction)}
        >
          {loadingAction === "/api/intelligence/business-profile" ? "Creando..." : "Crear perfil inteligente"}
        </button>
        <button
          type="button"
          onClick={() => runAction("/api/intelligence/generate-website", { leadId })}
          className="rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-sm font-semibold text-violet-700"
          disabled={Boolean(loadingAction)}
        >
          {loadingAction === "/api/intelligence/generate-website" ? "Generando..." : "Generar web personalizada"}
        </button>
        <button
          type="button"
          onClick={() => runAction("/api/intelligence/full-pipeline", { leadId, instruction })}
          className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-3 py-2 text-sm font-semibold text-white"
          disabled={Boolean(loadingAction)}
        >
          {loadingAction === "/api/intelligence/full-pipeline" ? (
            <span className="inline-flex items-center gap-1">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Pipeline...
            </span>
          ) : (
            "Pipeline completo"
          )}
        </button>
        <button
          type="button"
          onClick={() =>
            runAction("/api/intelligence/regenerate-website", {
              leadId,
              instruction,
            })
          }
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700"
          disabled={Boolean(loadingAction)}
        >
          {loadingAction === "/api/intelligence/regenerate-website" ? "Regenerando..." : "Regenerar web con instrucción"}
        </button>
      </div>
      <label className="block space-y-1">
        <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Instrucción</span>
        <input
          value={instruction}
          onChange={(event) => setInstruction(event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
          placeholder='ej: "más rústica y enfocada en reservas"'
        />
      </label>
      <div className="flex items-center gap-3">
        {demoUrl ? (
          <Link href={demoUrl} target="_blank" className="text-sm font-semibold text-violet-700 underline">
            Ver demo
          </Link>
        ) : (
          <span className="text-sm text-slate-500">Demo aún no disponible.</span>
        )}
        {feedback ? <p className="text-xs text-slate-600">{feedback}</p> : null}
      </div>
    </div>
  );
}
