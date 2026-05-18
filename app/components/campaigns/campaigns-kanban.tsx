"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  Mail,
  MessageCircle,
  Phone,
  Sparkles,
} from "lucide-react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { SectionCard } from "@/app/components/ui/section-card";
import { StatusBadge } from "@/app/components/ui/status-badge";
import { SectionToggle } from "@/app/components/ui/section-toggle";
import { MessageComposer } from "@/app/components/campaigns/message-composer";

export type CampaignLead = {
  id: string;
  name: string;
  city: string;
  category: string;
  score: number;
  status:
    | "new_lead"
    | "analyzed"
    | "website_generated"
    | "pending_approval"
    | "approved"
    | "contacted"
    | "responded"
    | "client";
  hasEmail: boolean;
  hasPhone: boolean;
  hasWhatsapp: boolean;
  hasInstagram: boolean;
  hasDemo: boolean;
};

type CampaignsKanbanProps = {
  initialLeads: CampaignLead[];
  useSupabase: boolean;
};

type Column = {
  id: CampaignLead["status"];
  label: string;
};

const columns: Column[] = [
  { id: "new_lead", label: "Nuevo lead" },
  { id: "analyzed", label: "Analizado" },
  { id: "website_generated", label: "Web generada" },
  { id: "pending_approval", label: "Pendiente aprobación" },
  { id: "approved", label: "Aprobado" },
  { id: "contacted", label: "Contactado" },
  { id: "responded", label: "Respondió" },
  { id: "client", label: "Cliente" },
];

const columnStyle: Record<CampaignLead["status"], string> = {
  new_lead: "border-slate-200 bg-slate-50",
  analyzed: "border-sky-200 bg-sky-50",
  website_generated: "border-indigo-200 bg-indigo-50",
  pending_approval: "border-amber-200 bg-amber-50",
  approved: "border-purple-200 bg-purple-50",
  contacted: "border-violet-200 bg-violet-50",
  responded: "border-emerald-200 bg-emerald-50",
  client: "border-green-200 bg-green-50",
};

const performanceData = [
  { name: "20 Abr", apertura: 19, respuesta: 8, clientes: 2 },
  { name: "27 Abr", apertura: 24, respuesta: 10, clientes: 2 },
  { name: "4 May", apertura: 30, respuesta: 13, clientes: 3 },
  { name: "11 May", apertura: 28, respuesta: 15, clientes: 4 },
  { name: "18 May", apertura: 34, respuesta: 18, clientes: 6 },
];

export function CampaignsKanban({ initialLeads, useSupabase }: CampaignsKanbanProps) {
  const [leads, setLeads] = useState<CampaignLead[]>(initialLeads);
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(
    initialLeads[0]?.id ?? null,
  );
  const [composerText, setComposerText] = useState(
    "Hola equipo, analizamos vuestro negocio y preparamos una propuesta visual para mejorar conversion y reservas. Os comparto una demo para revisarla en 2 minutos.",
  );
  const [feedback, setFeedback] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState("board");

  const selectedLead = useMemo(
    () => leads.find((lead) => lead.id === selectedLeadId) ?? leads[0] ?? null,
    [leads, selectedLeadId],
  );

  async function persistStatus(leadId: string, nextStatus: CampaignLead["status"]) {
    try {
      const response = await fetch("/api/leads/update-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ leadId, status: nextStatus }),
      });
      const json = (await response.json()) as { error?: string };
      if (!response.ok) {
        setFeedback(json.error ?? "No se pudo actualizar el estado en Supabase.");
      }
    } catch {
      setFeedback("Error al actualizar estado.");
    }
  }

  async function moveLead(leadId: string, targetStatus: CampaignLead["status"]) {
    const prevLeads = leads;
    const nextLeads = leads.map((lead) =>
      lead.id === leadId ? { ...lead, status: targetStatus } : lead,
    );
    setLeads(nextLeads);
    setFeedback(null);

    if (useSupabase) {
      await persistStatus(leadId, targetStatus);
    } else {
      setFeedback("Modo mock activo: cambio local aplicado.");
    }

    if (prevLeads === leads) return;
  }

  function handleDrop(targetStatus: CampaignLead["status"]) {
    if (!draggedLeadId) return;
    void moveLead(draggedLeadId, targetStatus);
    setDraggedLeadId(null);
  }

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-[#e5e7eb] bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-[#0f172a]">
              Campaña: Restaurantes Alicante
            </h2>
            <p className="mt-1 text-sm text-[#64748b]">
              CRM visual para mover leads desde prospección hasta cierre.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <SectionToggle
              value={viewMode}
              onChange={setViewMode}
              options={[
                { id: "board", label: "Kanban" },
                { id: "focus", label: "Enfoque" },
              ]}
            />
            <StatusBadge
              label={useSupabase ? "Conectado a Supabase" : "Modo mock"}
              tone={useSupabase ? "success" : "warning"}
            />
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-7">
        {columns.map((column) => {
          const columnLeads = leads.filter((lead) => lead.status === column.id);

          return (
            <article
              key={column.id}
              className={`rounded-2xl border p-3 ${columnStyle[column.id]}`}
              onDragOver={(event) => event.preventDefault()}
              onDrop={() => handleDrop(column.id)}
            >
              <div className="mb-3 flex items-center justify-between gap-2">
                <h3 className="text-sm font-semibold text-slate-900">{column.label}</h3>
                <span className="rounded-full bg-white px-2 py-0.5 text-xs font-medium text-slate-600">
                  {columnLeads.length}
                </span>
              </div>
              <div className="space-y-2">
                {columnLeads.map((lead) => (
                  <div
                    key={lead.id}
                    draggable
                    onDragStart={() => setDraggedLeadId(lead.id)}
                    onClick={() => setSelectedLeadId(lead.id)}
                    className="cursor-grab rounded-xl border border-[#e5e7eb] bg-white p-3 shadow-sm"
                  >
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-[#0f172a]">{lead.name}</p>
                      {lead.hasDemo ? (
                        <StatusBadge label="Demo" tone="success" className="px-2 py-0.5 text-[10px]" />
                      ) : null}
                    </div>
                    <p className="text-xs text-[#64748b]">
                      {lead.city} - {lead.category}
                    </p>
                    <p className="mt-1 text-xs font-medium text-amber-600">{lead.score}/100</p>
                    <div className="mt-2 flex flex-wrap items-center gap-1 text-slate-400">
                      {lead.hasEmail ? <Mail className="h-3.5 w-3.5" /> : null}
                      {lead.hasPhone ? <Phone className="h-3.5 w-3.5" /> : null}
                      {lead.hasWhatsapp ? <MessageCircle className="h-3.5 w-3.5" /> : null}
                      {lead.hasInstagram ? <Sparkles className="h-3.5 w-3.5" /> : null}
                    </div>
                    <div className="mt-2 flex justify-end">
                      <select
                        value={lead.status}
                        onChange={(event) =>
                          void moveLead(
                            lead.id,
                            event.target.value as CampaignLead["status"],
                          )
                        }
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px]"
                      >
                        {columns.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <MessageComposer
          recipient={selectedLead?.name ?? "Sin lead seleccionado"}
          subject="Idea para mejorar conversion esta semana"
          value={composerText}
          onChange={setComposerText}
        />

        <div className="space-y-6">
          <SectionCard title="Variantes rápidas" subtitle="Copys breves por canal">
            <ul className="space-y-2 text-sm text-slate-700">
              <li className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                Email: Propuesta visual para aumentar reservas.
              </li>
              <li className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                WhatsApp: Te comparto una demo adaptada a tu negocio.
              </li>
              <li className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                Instagram DM: Hemos preparado un rediseño orientado a captación.
              </li>
            </ul>
          </SectionCard>

          <SectionCard title="Secuencia de seguimiento" subtitle="Pipeline sugerido">
            <ol className="space-y-2 text-sm text-slate-700">
              <li className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                Día 1 - Email inicial
              </li>
              <li className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                Día 3 - WhatsApp seguimiento
              </li>
              <li className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                Día 7 - Segundo seguimiento
              </li>
              <li className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                Día 14 - Llamada comercial
              </li>
            </ol>
          </SectionCard>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1.2fr)]">
        <SectionCard title="Actividad del contacto" subtitle="Últimas interacciones">
          <ul className="space-y-2 text-sm text-slate-700">
            <li className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              Hoy 10:21 - Abrió email
            </li>
            <li className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              Ayer 18:14 - Clic en demo
            </li>
            <li className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
              Ayer 11:37 - Respondió en WhatsApp
            </li>
          </ul>
        </SectionCard>

        <SectionCard title="Asistente IA" subtitle="Siguiente mejor acción">
          <div className="rounded-xl border border-violet-200 bg-violet-50 p-4">
            <p className="text-sm font-semibold text-violet-800">Recomendación</p>
            <p className="mt-2 text-sm text-violet-900">
              Enviar hoy una variante corta por WhatsApp con el enlace de demo y CTA de 10
              minutos para revisión guiada.
            </p>
            <button className="mt-3 inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3 py-2 text-xs font-semibold text-white">
              Generar propuesta <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </SectionCard>

        <SectionCard title="Gráficos de rendimiento" subtitle="Apertura, respuesta y cierres">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="name" tickLine={false} axisLine={false} />
                <YAxis tickLine={false} axisLine={false} />
                <Tooltip />
                <Line type="monotone" dataKey="apertura" stroke="#7c3aed" strokeWidth={2.5} />
                <Line type="monotone" dataKey="respuesta" stroke="#22c55e" strokeWidth={2} />
                <Line type="monotone" dataKey="clientes" stroke="#f59e0b" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
              <p className="text-slate-500">Tasa apertura</p>
              <p className="font-semibold text-slate-900">31%</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
              <p className="text-slate-500">Tasa respuesta</p>
              <p className="font-semibold text-slate-900">12%</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
              <p className="text-slate-500">Llamadas</p>
              <p className="font-semibold text-slate-900">18</p>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-2">
              <p className="text-slate-500">Nuevos clientes</p>
              <p className="font-semibold text-slate-900">6</p>
            </div>
          </div>
        </SectionCard>
      </section>

      {feedback ? (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm text-slate-600">
          {feedback}
        </div>
      ) : null}
    </div>
  );
}
