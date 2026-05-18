import { SectionCard } from "@/app/components/ui/section-card";
import { StatusBadge } from "@/app/components/ui/status-badge";

export type LeadTableRow = {
  id: string;
  company: string;
  website?: string;
  sector: string;
  city: string;
  websiteScore: number;
  demoStatus: "Lista" | "En progreso" | "Pendiente";
  priority: "Alta" | "Media" | "Baja";
};

type LeadsTableProps = {
  leads: LeadTableRow[];
};

const statusTone: Record<LeadTableRow["demoStatus"], "success" | "warning" | "neutral"> = {
  Lista: "success",
  "En progreso": "warning",
  Pendiente: "neutral",
};

const priorityTone: Record<LeadTableRow["priority"], "danger" | "violet" | "info"> = {
  Alta: "danger",
  Media: "violet",
  Baja: "info",
};

export function LeadsTable({ leads }: LeadsTableProps) {
  return (
    <SectionCard
      title="Leads recientes"
      subtitle="Negocios priorizados por potencial de conversión."
      action={
        <button
          type="button"
          className="rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white shadow-sm"
        >
          Ver todos
        </button>
      }
    >
      <div className="overflow-x-auto">
        <table className="w-full min-w-[680px] border-collapse">
          <thead>
            <tr className="text-left text-xs uppercase tracking-wide text-[#64748b]">
              <th className="pb-3 font-medium">Empresa</th>
              <th className="pb-3 font-medium">Sector</th>
              <th className="pb-3 font-medium">Ciudad</th>
              <th className="pb-3 font-medium">Score web</th>
              <th className="pb-3 font-medium">Demo</th>
              <th className="pb-3 font-medium">Prioridad</th>
              <th className="pb-3 font-medium">Acción</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id} className="border-t border-[#e5e7eb] text-sm text-[#64748b]">
                <td className="py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-gradient-to-r from-violet-500 to-indigo-500" />
                    <div>
                      <p className="font-medium text-[#0f172a]">{lead.company}</p>
                      <p className="text-xs text-[#64748b]">{lead.website ?? "www.leadweb-demo.com"}</p>
                    </div>
                  </div>
                </td>
                <td className="py-3.5">{lead.sector}</td>
                <td className="py-3.5">{lead.city}</td>
                <td className="py-3.5 font-medium text-emerald-700">{lead.websiteScore}/100</td>
                <td className="py-3.5">
                  <StatusBadge label={lead.demoStatus} tone={statusTone[lead.demoStatus]} />
                </td>
                <td className="py-3.5">
                  <StatusBadge label={lead.priority} tone={priorityTone[lead.priority]} />
                </td>
                <td className="py-3.5">
                  <button className="text-xs font-semibold text-violet-600 hover:text-violet-700">
                    Ver detalle
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SectionCard>
  );
}
