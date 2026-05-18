import Link from "next/link";

export default function RootNotFound() {
  return (
    <main className="min-h-screen bg-[#f8fafc] px-4 py-16">
      <div className="mx-auto max-w-3xl rounded-3xl border border-[#e5e7eb] bg-white p-8 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-500">
          404
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#0f172a]">
          Página no encontrada
        </h1>
        <p className="mt-3 text-sm text-[#64748b]">
          El recurso que buscas no existe o ha sido movido.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Link
            href="/dashboard"
            className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Ir al dashboard
          </Link>
          <Link
            href="/leads"
            className="rounded-xl border border-[#e5e7eb] bg-white px-4 py-2 text-sm font-semibold text-[#0f172a]"
          >
            Ver leads
          </Link>
        </div>
      </div>
    </main>
  );
}
