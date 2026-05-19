"use client";

import { useState } from "react";
import { Loader2, Save, Sparkles } from "lucide-react";
import { SectionCard } from "@/app/components/ui/section-card";

type LeadMessageContext = {
  leadId: string;
  businessName: string;
  city: string;
  category: string;
  detectedProblems: string[];
};

type GeneratedWebsiteMessageContext = {
  id: string | null;
  demoSlug: string | null;
};

type SalesMessageSectionProps = {
  lead: LeadMessageContext;
  generatedWebsite: GeneratedWebsiteMessageContext;
  initialChannel?: "email" | "whatsapp" | "instagram_dm" | "call_script";
  initialSubject?: string;
  initialBody?: string;
};

export function SalesMessageSection({
  lead,
  generatedWebsite,
  initialChannel = "email",
  initialSubject = "",
  initialBody = "",
}: SalesMessageSectionProps) {
  const [channel, setChannel] = useState<
    "email" | "whatsapp" | "instagram_dm" | "call_script"
  >(initialChannel);
  const [subject, setSubject] = useState(initialSubject);
  const [body, setBody] = useState(initialBody);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleGenerate() {
    try {
      setIsGenerating(true);
      setFeedback(null);

      const response = await fetch("/api/agent/generate-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lead: {
            id: lead.leadId,
            businessName: lead.businessName,
            city: lead.city,
            category: lead.category,
            detectedProblems: lead.detectedProblems,
          },
          generatedWebsite: {
            id: generatedWebsite.id,
            demo_slug: generatedWebsite.demoSlug,
            demoUrl: generatedWebsite.demoSlug
              ? `${window.location.origin}/demo/${generatedWebsite.demoSlug}`
              : generatedWebsite.id
                ? `${window.location.origin}/demo/${generatedWebsite.id}`
                : "unknown",
          },
          channel,
        }),
      });

      const json = (await response.json()) as {
        error?: string;
        subject?: string;
        body?: string;
      };

      if (!response.ok) {
        setFeedback(json.error ?? "No se pudo generar el mensaje.");
        return;
      }

      setSubject(json.subject ?? "");
      setBody(json.body ?? "");
      setFeedback("Mensaje generado por IA y guardado como borrador.");
    } catch {
      setFeedback("Error inesperado al generar mensaje.");
    } finally {
      setIsGenerating(false);
    }
  }

  async function handleSave() {
    if (!body.trim()) {
      setFeedback("El cuerpo del mensaje no puede estar vacío.");
      return;
    }

    try {
      setIsSaving(true);
      setFeedback(null);

      const response = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: lead.leadId,
          generatedWebsiteId: generatedWebsite.id,
          channel,
          subject,
          body,
        }),
      });
      const json = (await response.json()) as { error?: string };
      if (!response.ok) {
        setFeedback(json.error ?? "No se pudo guardar el mensaje.");
        return;
      }

      setFeedback("Mensaje guardado correctamente.");
    } catch {
      setFeedback("Error inesperado al guardar.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <SectionCard
      title="Mensaje sugerido"
      subtitle="Editor de outreach con IA por canal."
      action={
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white"
        >
          {isGenerating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Sparkles className="h-4 w-4" />
          )}
          Generar con IA
        </button>
      }
    >
      <div className="space-y-3">
        <label className="block space-y-1">
          <span className="text-xs font-semibold uppercase text-slate-500">Canal</span>
          <select
            value={channel}
            onChange={(event) =>
              setChannel(
                event.target.value as
                  | "email"
                  | "whatsapp"
                  | "instagram_dm"
                  | "call_script",
              )
            }
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          >
            <option value="email">Email</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="instagram_dm">Instagram DM</option>
            <option value="call_script">Call Script</option>
          </select>
        </label>

        <label className="block space-y-1">
          <span className="text-xs font-semibold uppercase text-slate-500">Asunto</span>
          <input
            value={subject}
            onChange={(event) => setSubject(event.target.value)}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
          />
        </label>

        <label className="block space-y-1">
          <span className="text-xs font-semibold uppercase text-slate-500">Mensaje</span>
          <textarea
            value={body}
            onChange={(event) => setBody(event.target.value)}
            rows={8}
            className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm leading-relaxed"
          />
        </label>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
          >
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Guardar
          </button>
        </div>
        {feedback ? <p className="text-xs text-slate-600">{feedback}</p> : null}
      </div>
    </SectionCard>
  );
}
