"use client";

import { useState } from "react";
import { AlertTriangle, Loader2, Save, Trash2 } from "lucide-react";
import { SectionCard } from "@/app/components/ui/section-card";
import type { PlatformBrandSettings } from "@/src/lib/settings/platform-brand";

type PlatformBrandSettingsFormProps = {
  initialValue: PlatformBrandSettings;
};

export function PlatformBrandSettingsForm({
  initialValue,
}: PlatformBrandSettingsFormProps) {
  const [form, setForm] = useState<PlatformBrandSettings>(initialValue);
  const [isSaving, setIsSaving] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleSave() {
    try {
      setIsSaving(true);
      setFeedback(null);

      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = (await response.json()) as { error?: string };
      if (!response.ok) {
        setFeedback(json.error ?? "No se pudo guardar la configuración.");
        return;
      }

      setFeedback("Configuración guardada correctamente.");
    } catch {
      setFeedback("Error inesperado al guardar.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleClearTestData() {
    const confirmation = window.prompt(
      "Acción irreversible. Escribe BORRAR PRUEBAS para confirmar.",
      "",
    );
    if (!confirmation) return;

    try {
      setIsClearing(true);
      setFeedback(null);

      const response = await fetch("/api/admin/clear-test-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmText: confirmation }),
      });
      const json = (await response.json()) as { error?: string };
      if (!response.ok) {
        setFeedback(json.error ?? "No se pudo borrar los datos de prueba.");
        return;
      }

      setFeedback(
        "Datos de prueba eliminados: leads, demos, campañas, mensajes, actividad e historial.",
      );
    } catch {
      setFeedback("Error inesperado al borrar datos de prueba.");
    } finally {
      setIsClearing(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
          Marca de la plataforma
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Personaliza cómo se presentan demos y mensajes comerciales.
        </p>
      </section>

      <SectionCard
        title="Identidad de marca"
        subtitle="Datos utilizados en mensajes, propuestas y demos públicas."
        action={
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar
          </button>
        }
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase text-slate-500">
              Nombre de agencia
            </span>
            <input
              value={form.agencyName}
              onChange={(event) =>
                setForm((current) => ({ ...current, agencyName: event.target.value }))
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase text-slate-500">Logo (URL)</span>
            <input
              value={form.logoUrl}
              onChange={(event) =>
                setForm((current) => ({ ...current, logoUrl: event.target.value }))
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase text-slate-500">
              Color principal
            </span>
            <input
              value={form.primaryColor}
              onChange={(event) =>
                setForm((current) => ({ ...current, primaryColor: event.target.value }))
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase text-slate-500">
              Nombre del comercial
            </span>
            <input
              value={form.salesRepName}
              onChange={(event) =>
                setForm((current) => ({ ...current, salesRepName: event.target.value }))
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase text-slate-500">
              Email comercial
            </span>
            <input
              value={form.salesRepEmail}
              onChange={(event) =>
                setForm((current) => ({ ...current, salesRepEmail: event.target.value }))
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase text-slate-500">Teléfono</span>
            <input
              value={form.salesRepPhone}
              onChange={(event) =>
                setForm((current) => ({ ...current, salesRepPhone: event.target.value }))
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
        </div>

        <div className="mt-4 grid gap-4">
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase text-slate-500">Firma de email</span>
            <textarea
              rows={4}
              value={form.emailSignature}
              onChange={(event) =>
                setForm((current) => ({ ...current, emailSignature: event.target.value }))
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase text-slate-500">
              Texto legal / disclaimer
            </span>
            <textarea
              rows={4}
              value={form.legalDisclaimer}
              onChange={(event) =>
                setForm((current) => ({ ...current, legalDisclaimer: event.target.value }))
              }
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase text-slate-500">
              Dominio base para demos
            </span>
            <input
              value={form.demoBaseDomain}
              onChange={(event) =>
                setForm((current) => ({ ...current, demoBaseDomain: event.target.value }))
              }
              placeholder="https://demo.tuagencia.com"
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
        </div>
        {feedback ? <p className="mt-3 text-xs text-slate-600">{feedback}</p> : null}
      </SectionCard>

      <SectionCard
        title="Zona de peligro"
        subtitle="Borrado masivo para limpiar datos de pruebas."
        action={
          <button
            type="button"
            onClick={handleClearTestData}
            disabled={isClearing}
            className="inline-flex items-center gap-2 rounded-xl border border-rose-300 bg-rose-50 px-4 py-2 text-sm font-semibold text-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isClearing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Borrar datos de prueba
          </button>
        }
      >
        <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
          <p className="inline-flex items-start gap-2">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            Elimina toda la data generada en pruebas: leads, demos, campañas, mensajes,
            actividades e historial de versiones.
          </p>
        </div>
      </SectionCard>
    </div>
  );
}
