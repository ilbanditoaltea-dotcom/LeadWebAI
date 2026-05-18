import { ExternalLink, Eye } from "lucide-react";
import { SectionCard } from "@/app/components/ui/section-card";

export function DemoCard() {
  return (
    <SectionCard
      title="Demo generada"
      subtitle="Versión recomendada para enviar al lead."
      action={
        <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
          Alta conversión
        </span>
      }
    >
      <div className="rounded-2xl border border-violet-100 bg-gradient-to-r from-violet-50 to-fuchsia-50 p-4">
        <p className="text-sm text-[#64748b]">Cliente objetivo</p>
        <h3 className="text-lg font-semibold text-[#0f172a]">Clínica Sonrisa+</h3>
        <p className="mt-2 text-sm text-[#64748b]">
          Landing con nuevo hero, CTA de reserva, testimonios y formulario de contacto
          simplificado.
        </p>
      </div>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {["Diseño premium", "Reservas online", "WhatsApp integrado"].map((tag) => (
          <span
            key={tag}
            className="rounded-lg border border-[#e5e7eb] bg-white px-3 py-1 text-center text-xs font-medium text-[#64748b]"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white"
        >
          <Eye className="h-4 w-4" />
          Ver demo
        </button>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-xl border border-[#e5e7eb] bg-white px-4 py-2 text-sm font-semibold text-[#0f172a]"
        >
          <ExternalLink className="h-4 w-4" />
          Compartir URL
        </button>
      </div>
    </SectionCard>
  );
}
