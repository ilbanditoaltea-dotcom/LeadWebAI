"use client";

type PlatformErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function PlatformError({ error, reset }: PlatformErrorProps) {
  return (
    <div className="rounded-2xl border border-rose-200 bg-white p-6 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-rose-600">Error de módulo</p>
      <h2 className="mt-2 text-xl font-semibold text-[#0f172a]">
        No pudimos cargar esta sección
      </h2>
      <p className="mt-1 text-sm text-[#64748b]">
        {error.message || "Inténtalo de nuevo en unos segundos."}
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-4 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white"
      >
        Reintentar
      </button>
    </div>
  );
}
