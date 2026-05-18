"use client";

import { useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

type AnalyzeWithAiButtonProps = {
  payload: {
    leadId: string;
    businessName: string;
    category?: string;
    city?: string;
    description?: string;
    websiteUrl?: string;
    googleMapsUrl?: string;
    instagramUrl?: string;
  };
};

export function AnalyzeWithAiButton({ payload }: AnalyzeWithAiButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function handleAnalyze() {
    try {
      setIsLoading(true);
      setMessage(null);

      const response = await fetch("/api/ai/analyze-business", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const responseJson = (await response.json()) as { error?: string };

      if (!response.ok) {
        setMessage(responseJson.error ?? "No se pudo analizar este lead.");
        return;
      }

      setMessage("Analisis completado. Lead actualizado en Supabase.");
      router.refresh();
    } catch {
      setMessage("Error inesperado al llamar a la API de analisis.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleAnalyze}
        disabled={isLoading}
        className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-70"
      >
        {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        Analizar con IA
      </button>
      {message ? <p className="text-xs text-slate-600">{message}</p> : null}
    </div>
  );
}
