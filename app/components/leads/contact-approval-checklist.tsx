"use client";

import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { SectionCard } from "@/app/components/ui/section-card";

const checklistItems = [
  "Datos del negocio revisados",
  "Demo visual revisada",
  "Mensaje personalizado revisado",
  "Canal de contacto elegido",
  "Cumplimiento legal revisado",
  "No parece mensaje masivo",
  "El usuario aprueba contactar manualmente",
] as const;

type ContactApprovalChecklistProps = {
  leadId: string;
  currentStatus: string;
};

export function ContactApprovalChecklist({
  leadId,
  currentStatus,
}: ContactApprovalChecklistProps) {
  const router = useRouter();
  const [checkedMap, setCheckedMap] = useState<Record<string, boolean>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const allChecked = useMemo(
    () => checklistItems.every((item) => Boolean(checkedMap[item])),
    [checkedMap],
  );

  async function handleApprove() {
    if (!allChecked) return;

    try {
      setIsSubmitting(true);
      setFeedback(null);

      const response = await fetch("/api/leads/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId,
          status: "approved",
        }),
      });
      const json = (await response.json()) as { error?: string };

      if (!response.ok) {
        setFeedback(json.error ?? "No se pudo marcar como aprobado.");
        return;
      }

      setFeedback("Lead aprobado para contacto manual.");
      router.refresh();
    } catch {
      setFeedback("Error inesperado al marcar aprobación.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SectionCard
      title="Aprobación antes de contactar"
      subtitle="Checklist obligatorio para evitar envíos no controlados."
    >
      <div className="space-y-3">
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <div className="flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <p>
              Revisa la normativa aplicable antes de enviar comunicaciones comerciales no
              solicitadas.
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {checklistItems.map((item) => (
            <label
              key={item}
              className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
            >
              <input
                type="checkbox"
                checked={Boolean(checkedMap[item])}
                onChange={(event) =>
                  setCheckedMap((current) => ({
                    ...current,
                    [item]: event.target.checked,
                  }))
                }
                className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
              />
              {item}
            </label>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleApprove}
            disabled={!allChecked || isSubmitting}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle2 className="h-4 w-4" />
            )}
            Marcar como aprobado
          </button>
          <span className="text-xs text-slate-500">
            Estado actual: <strong>{currentStatus}</strong>
          </span>
        </div>

        <p className="text-xs text-slate-500">
          Este sistema no envía mensajes automáticamente: solo prepara el contenido para copiar
          o enviar manualmente.
        </p>

        {feedback ? <p className="text-xs text-slate-600">{feedback}</p> : null}
      </div>
    </SectionCard>
  );
}
