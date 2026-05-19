"use client";

import Link from "next/link";
import { Copy, Send } from "lucide-react";
import { useState } from "react";
import { SectionCard } from "@/app/components/ui/section-card";

export function MessageCard() {
  const [copied, setCopied] = useState(false);
  const message =
    "Hola equipo de Clínica Sonrisa+, hemos analizado vuestra presencia digital y detectamos oportunidades claras para captar más pacientes desde móvil. Preparamos una demo personalizada con una estructura orientada a conversión para que la podáis revisar en menos de 2 minutos.";

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(message);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <SectionCard
      title="Mensaje sugerido"
      subtitle="Propuesta comercial generada por IA."
    >
      <div className="rounded-2xl border border-violet-100 bg-[#f8fafc] p-4">
        <p className="text-sm leading-relaxed text-[#0f172a]">
          {message}
        </p>
      </div>
      <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
        Tono sugerido: consultivo + cercano | Longitud: corta
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-2 rounded-xl border border-[#e5e7eb] bg-white px-4 py-2 text-sm font-semibold text-[#0f172a]"
        >
          <Copy className="h-4 w-4" />
          {copied ? "Copiado" : "Copiar texto"}
        </button>
        <Link
          href="/campaigns"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white"
        >
          <Send className="h-4 w-4" />
          Enviar a campaña
        </Link>
      </div>
    </SectionCard>
  );
}
