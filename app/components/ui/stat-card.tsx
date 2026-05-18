import { ArrowDownRight, ArrowUpRight } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string;
  variation: string;
  trend: "up" | "down";
};

export function StatCard({ title, value, variation, trend }: StatCardProps) {
  const isUp = trend === "up";

  return (
    <article className="rounded-2xl border border-[#e5e7eb] bg-white p-4 shadow-sm shadow-slate-200/50 sm:p-5">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">{title}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight text-[#0f172a]">{value}</p>
      <div
        className={`mt-3 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-semibold ${
          isUp
            ? "bg-emerald-100 text-emerald-700"
            : "bg-rose-100 text-rose-700"
        }`}
      >
        {isUp ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
        {variation}
      </div>
    </article>
  );
}
