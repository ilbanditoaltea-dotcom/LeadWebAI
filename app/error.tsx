"use client";

type RootErrorProps = {
  error: Error & { digest?: string };
  reset: () => void;
};

export default function RootError({ error, reset }: RootErrorProps) {
  return (
    <main className="min-h-screen bg-[#f8fafc] px-4 py-12">
      <div className="mx-auto max-w-3xl rounded-2xl border border-rose-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-rose-600">Error</p>
        <h1 className="mt-2 text-2xl font-semibold text-[#0f172a]">
          Ha ocurrido un problema inesperado
        </h1>
        <p className="mt-2 text-sm text-[#64748b]">
          {error.message || "No se pudo completar la operación."}
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-5 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Reintentar
        </button>
      </div>
    </main>
  );
}
