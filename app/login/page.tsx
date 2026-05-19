"use client";

import { useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next") || "/dashboard";

  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(json.error ?? "No se pudo iniciar sesión.");
        return;
      }
      router.push(nextPath);
      router.refresh();
    } catch {
      setError("Error inesperado al iniciar sesión.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-5 flex items-center gap-3">
          <div className="rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 p-2 text-white">
            <Lock className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm text-slate-500">LeadWeb AI</p>
            <h1 className="text-xl font-semibold text-slate-900">Acceso privado</h1>
          </div>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <label className="space-y-1">
            <span className="text-xs font-semibold uppercase text-slate-500">Contraseña</span>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm"
              placeholder="Introduce la clave del equipo"
              required
            />
          </label>
          <button
            type="submit"
            disabled={isLoading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Entrar
          </button>
        </form>

        {error ? <p className="mt-3 text-xs text-rose-600">{error}</p> : null}
      </section>
    </main>
  );
}
