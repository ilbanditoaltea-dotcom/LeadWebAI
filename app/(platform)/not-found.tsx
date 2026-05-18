import Link from "next/link";

export default function PlatformNotFound() {
  return (
    <div className="rounded-2xl border border-[#e5e7eb] bg-white p-8 text-center shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">
        Recurso no encontrado
      </p>
      <h2 className="mt-2 text-2xl font-semibold text-[#0f172a]">
        No encontramos este contenido
      </h2>
      <p className="mt-2 text-sm text-[#64748b]">
        Comprueba la URL o vuelve al panel principal.
      </p>
      <div className="mt-5 flex items-center justify-center gap-2">
        <Link
          href="/dashboard"
          className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white"
        >
          Volver al panel
        </Link>
      </div>
    </div>
  );
}
