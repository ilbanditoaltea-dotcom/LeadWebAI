import Link from "next/link";

export default function DemoNotFound() {
  return (
    <main className="min-h-screen bg-[#f6f7fb] px-4 py-16">
      <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-violet-500">
          Demo publica
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
          Esta demo no existe o ya no está disponible
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          Comprueba que el enlace sea correcto o vuelve al panel para generar una nueva propuesta.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <Link
            href="/dashboard"
            className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white"
          >
            Volver al panel
          </Link>
          <Link
            href="/demos"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700"
          >
            Ver demos
          </Link>
        </div>
      </div>
    </main>
  );
}
