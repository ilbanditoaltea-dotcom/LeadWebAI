type OpportunityScoreProps = {
  value: number;
  label?: string;
};

function resolveTone(value: number) {
  if (value >= 75) return "text-emerald-600";
  if (value >= 50) return "text-amber-500";
  return "text-rose-500";
}

function resolveLabel(value: number) {
  if (value >= 75) return "Oportunidad alta";
  if (value >= 50) return "Oportunidad media";
  return "Oportunidad baja";
}

export function OpportunityScore({ value, label }: OpportunityScoreProps) {
  return (
    <div className="min-w-[250px] space-y-2 rounded-2xl border border-[#e5e7eb] bg-[#f8fafc] p-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-[#64748b]">
        Puntuacion de oportunidad
      </p>
      <p className={`text-4xl font-semibold ${resolveTone(value)}`}>{value}/100</p>
      <p className="text-sm text-[#64748b]">{label ?? resolveLabel(value)}</p>
    </div>
  );
}
