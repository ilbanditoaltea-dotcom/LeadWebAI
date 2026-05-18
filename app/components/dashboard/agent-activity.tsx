import type { AgentActivityItem } from "@/app/lib/mock-data";
import { SectionCard } from "@/app/components/ui/section-card";

type AgentActivityProps = {
  items: AgentActivityItem[];
};

export function AgentActivity({ items }: AgentActivityProps) {
  return (
    <SectionCard
      title="Actividad del agente"
      subtitle="Eventos automáticos de análisis y generación."
    >
      <ul className="space-y-3">
        {items.map((item) => {
          const Icon = item.icon;

          return (
            <li key={item.title} className="flex items-start gap-3 rounded-xl border border-[#e5e7eb] bg-[#f8fafc] p-3">
              <div className="mt-0.5 rounded-xl bg-violet-100 p-2 text-violet-700">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-sm font-semibold text-[#0f172a]">{item.title}</p>
                  <span className="rounded-full bg-white px-2 py-0.5 text-xs text-[#64748b]">
                    {item.time}
                  </span>
                </div>
                <p className="mt-1 text-sm text-[#64748b]">{item.detail}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </SectionCard>
  );
}
