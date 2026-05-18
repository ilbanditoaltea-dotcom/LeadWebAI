"use client";

import { useState } from "react";
import { Loader2, RotateCcw } from "lucide-react";
import { useRouter } from "next/navigation";
import { SectionCard } from "@/app/components/ui/section-card";

export type GeneratedWebsiteVersionView = {
  id: string;
  versionNumber: number;
  changeType: string;
  instruction: string;
  createdAt: string;
};

type GeneratedWebsiteVersionsProps = {
  versions: GeneratedWebsiteVersionView[];
};

export function GeneratedWebsiteVersions({ versions }: GeneratedWebsiteVersionsProps) {
  const router = useRouter();
  const [loadingVersionId, setLoadingVersionId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);

  async function handleRestore(versionId: string) {
    try {
      setLoadingVersionId(versionId);
      setFeedback(null);

      const response = await fetch(
        `/api/generated-website-versions/${versionId}/restore`,
        { method: "POST" },
      );
      const json = (await response.json()) as { error?: string };

      if (!response.ok) {
        setFeedback(json.error ?? "No se pudo restaurar la version.");
        return;
      }

      setFeedback("Version restaurada correctamente.");
      router.refresh();
    } catch {
      setFeedback("Error inesperado al restaurar.");
    } finally {
      setLoadingVersionId(null);
    }
  }

  return (
    <SectionCard title="Historial de versiones" subtitle="Registros de regeneración y cambios">
      {versions.length === 0 ? (
        <p className="text-sm text-slate-600">Aun no hay versiones guardadas.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] border-collapse">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-slate-500">
                <th className="pb-3 font-medium">Versión</th>
                <th className="pb-3 font-medium">Fecha</th>
                <th className="pb-3 font-medium">Tipo de cambio</th>
                <th className="pb-3 font-medium">Instrucción</th>
                <th className="pb-3 font-medium">Acción</th>
              </tr>
            </thead>
            <tbody>
              {versions.map((version) => (
                <tr key={version.id} className="border-t border-slate-100 text-sm text-slate-700">
                  <td className="py-3 font-semibold text-slate-900">v{version.versionNumber}</td>
                  <td className="py-3">{version.createdAt}</td>
                  <td className="py-3">
                    <span className="rounded-full bg-violet-100 px-2.5 py-1 text-xs font-medium text-violet-700">
                      {version.changeType}
                    </span>
                  </td>
                  <td className="py-3">{version.instruction}</td>
                  <td className="py-3">
                    <button
                      type="button"
                      onClick={() => handleRestore(version.id)}
                      disabled={loadingVersionId === version.id}
                      className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700"
                    >
                      {loadingVersionId === version.id ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <RotateCcw className="h-3.5 w-3.5" />
                      )}
                      Restaurar versión
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {feedback ? <p className="mt-3 text-xs text-slate-600">{feedback}</p> : null}
    </SectionCard>
  );
}
