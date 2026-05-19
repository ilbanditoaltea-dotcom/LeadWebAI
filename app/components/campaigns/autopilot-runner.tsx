"use client";

import { useState } from "react";
import { Loader2, Play, ShieldCheck } from "lucide-react";
import { SectionCard } from "@/app/components/ui/section-card";

type RunResult = {
  campaign: {
    id: string | null;
    name: string;
    city: string;
    category: string;
  };
  discoveredCount: number;
  processedCount: number;
  pendingApprovalCount: number;
  failedCount: number;
  mode: string;
  truncatedByTimeBudget?: boolean;
  truncatedBySafeLimit?: boolean;
  requestedLimit?: number;
  effectiveLimit?: number;
  results: Array<{
    businessName: string;
    leadId: string | null;
    generatedWebsiteId: string | null;
    messageId: string | null;
    status: "pending_approval" | "error";
    error?: string;
  }>;
};

export function AutopilotRunner() {
  const [city, setCity] = useState("Alicante");
  const [category, setCategory] = useState("restaurant");
  const [limit, setLimit] = useState(3);
  const [isRunning, setIsRunning] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [result, setResult] = useState<RunResult | null>(null);

  async function runCampaign() {
    try {
      setIsRunning(true);
      setFeedback(null);
      const response = await fetch("/api/agent/run-campaign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ city, category, limit }),
      });
      const json = (await response.json()) as RunResult | { error: string };
      if (!response.ok || "error" in json) {
        setFeedback("error" in json ? json.error : "Autopilot execution failed.");
        return;
      }
      setResult(json);
      setFeedback(
        json.truncatedBySafeLimit
          ? `Autopilot parcial: este entorno procesa ${json.effectiveLimit}/${json.requestedLimit} por ejecución para evitar timeout.`
          : json.truncatedByTimeBudget
            ? `Autopilot parcial: ${json.pendingApprovalCount}/${json.processedCount} en pending_approval (recorta el limite para evitar timeout).`
          : `Autopilot completado: ${json.pendingApprovalCount}/${json.processedCount} en pending_approval.`,
      );
    } catch {
      setFeedback("Error inesperado ejecutando autopilot.");
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <SectionCard
      title="Autopilot Campaign Runner"
      subtitle="Descubre negocios, escanea webs y genera demo + mensaje automáticamente."
      action={
        <button
          type="button"
          onClick={runCampaign}
          disabled={isRunning}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white"
        >
          {isRunning ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
          Ejecutar autopilot
        </button>
      }
    >
      <div className="grid gap-3 md:grid-cols-3">
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase text-slate-500">Ciudad</span>
          <input
            value={city}
            onChange={(event) => setCity(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase text-slate-500">Categoría</span>
          <input
            value={category}
            onChange={(event) => setCategory(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
          />
        </label>
        <label className="space-y-1">
          <span className="text-xs font-semibold uppercase text-slate-500">Límite</span>
          <input
            type="number"
            min={1}
            max={20}
            value={limit}
            onChange={(event) => setLimit(Number(event.target.value))}
            className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
          />
        </label>
      </div>

      <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
        El flujo funciona sin intervención humana y deja cada lead en{" "}
        <span className="font-semibold">pending_approval</span> para confirmación manual.
        <br />
        En Vercel (plan free), se recomienda 1 lead por ejecución para evitar timeout.
      </div>

      {feedback ? <p className="mt-4 text-sm text-slate-700">{feedback}</p> : null}

      {result ? (
        <div className="mt-4 space-y-3">
          <div className="grid gap-2 md:grid-cols-4">
            <article className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Descubiertos</p>
              <p className="text-lg font-semibold text-slate-900">{result.discoveredCount}</p>
            </article>
            <article className="rounded-xl border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Procesados</p>
              <p className="text-lg font-semibold text-slate-900">{result.processedCount}</p>
            </article>
            <article className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
              <p className="text-xs text-emerald-700">Pending approval</p>
              <p className="text-lg font-semibold text-emerald-800">{result.pendingApprovalCount}</p>
            </article>
            <article className="rounded-xl border border-rose-200 bg-rose-50 p-3">
              <p className="text-xs text-rose-700">Fallidos</p>
              <p className="text-lg font-semibold text-rose-800">{result.failedCount}</p>
            </article>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="mb-2 inline-flex items-center gap-1 text-xs font-semibold uppercase text-slate-500">
              <ShieldCheck className="h-3.5 w-3.5" />
              Modo: {result.mode}
            </p>
            <ul className="space-y-1 text-sm">
              {result.results.slice(0, 8).map((item) => (
                <li key={`${item.businessName}-${item.leadId ?? "none"}`} className="rounded-lg border border-slate-100 bg-slate-50 px-2 py-1.5">
                  <span className="font-medium text-slate-900">{item.businessName}</span> -{" "}
                  <span
                    className={
                      item.status === "pending_approval" ? "text-emerald-700" : "text-rose-700"
                    }
                  >
                    {item.status}
                  </span>
                  {item.error ? ` (${item.error})` : ""}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : null}
    </SectionCard>
  );
}
