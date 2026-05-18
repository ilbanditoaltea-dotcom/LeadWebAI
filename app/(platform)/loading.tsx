export default function PlatformLoading() {
  return (
    <div className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
      <div className="flex items-center gap-3">
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-violet-600 border-t-transparent" />
        <p className="text-sm font-medium text-[#64748b]">Cargando módulo...</p>
      </div>
    </div>
  );
}
