type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-[#e5e7eb] bg-white p-8 text-center">
      <p className="text-base font-semibold text-[#0f172a]">{title}</p>
      <p className="mt-1 text-sm text-[#64748b]">{description}</p>
    </div>
  );
}
