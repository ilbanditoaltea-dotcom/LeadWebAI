"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { PerformancePoint } from "@/app/lib/mock-data";
import { SectionCard } from "@/app/components/ui/section-card";

type PerformanceChartProps = {
  data: PerformancePoint[];
};

export function PerformanceChart({ data }: PerformanceChartProps) {
  return (
    <SectionCard
      title="Rendimiento semanal"
      subtitle="Evolución de leads, respuestas y cierres."
    >
      <div className="h-72 min-h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                borderColor: "#ddd6fe",
                boxShadow: "0 8px 24px rgba(15, 23, 42, 0.08)",
              }}
            />
            <Line
              type="monotone"
              dataKey="leads"
              stroke="#7c3aed"
              strokeWidth={3}
              dot={{ r: 3 }}
              activeDot={{ r: 5 }}
            />
            <Line
              type="monotone"
              dataKey="responses"
              stroke="#ec4899"
              strokeWidth={2}
              dot={{ r: 2.5 }}
            />
            <Line
              type="monotone"
              dataKey="clients"
              stroke="#0ea5e9"
              strokeWidth={2}
              dot={{ r: 2.5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-4">
        {[
          { label: "Tasa de respuesta", value: "25.8%", trend: "+5.2%" },
          { label: "Conversion a cliente", value: "9.7%", trend: "+2.1%" },
          { label: "Valor medio cliente", value: "127 EUR/mes", trend: "+11.4%" },
          { label: "Ingresos generados", value: "2.286 EUR", trend: "+18%" },
        ].map((kpi) => (
          <article key={kpi.label} className="rounded-xl border border-[#e5e7eb] bg-[#f8fafc] p-3">
            <p className="text-xs text-[#64748b]">{kpi.label}</p>
            <p className="mt-1 text-lg font-semibold text-[#0f172a]">{kpi.value}</p>
            <p className="text-xs font-medium text-emerald-700">{kpi.trend}</p>
          </article>
        ))}
      </div>
    </SectionCard>
  );
}
