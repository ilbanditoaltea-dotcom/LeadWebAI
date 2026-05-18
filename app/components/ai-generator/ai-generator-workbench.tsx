"use client";

import { useMemo, useState } from "react";
import {
  Building2,
  Home,
  Laptop2,
  Palette,
  RefreshCw,
  Save,
  Send,
  Sparkles,
  Smartphone,
  WandSparkles,
} from "lucide-react";
import { WebsiteRenderer } from "@/src/components/website-blocks/WebsiteRenderer";
import type { GeneratedWebsite, WebsiteGoal } from "@/src/lib/types/ai-website";
import { generatedWebsiteMocksById } from "@/src/lib/types/ai-website";

type GoalOption = {
  value: "reservas" | "citas" | "llamadas" | "whatsapp" | "ventas" | "leads";
  label: string;
  websiteGoal: WebsiteGoal;
};

const goalOptions: GoalOption[] = [
  { value: "reservas", label: "Reservas", websiteGoal: "get_reservations" },
  { value: "citas", label: "Citas", websiteGoal: "get_appointments" },
  { value: "llamadas", label: "Llamadas", websiteGoal: "get_calls" },
  { value: "whatsapp", label: "WhatsApp", websiteGoal: "get_whatsapp_messages" },
  { value: "ventas", label: "Ventas", websiteGoal: "sell_products" },
  { value: "leads", label: "Leads", websiteGoal: "capture_leads" },
];

const detectedProblems = [
  "web antigua",
  "sin reservas online",
  "sin WhatsApp visible",
  "mala experiencia móvil",
  "sin carta online",
  "sin catálogo",
  "poca confianza visual",
  "sin SEO local",
] as const;

const categories = [
  "restaurant",
  "clinic",
  "barbershop",
  "beauty",
  "shop",
  "fitness",
  "hotel",
  "generic",
] as const;

const categoryLabels: Record<(typeof categories)[number], string> = {
  restaurant: "Restaurante",
  clinic: "Clinica",
  barbershop: "Peluqueria",
  beauty: "Belleza",
  shop: "Tienda",
  fitness: "Fitness",
  hotel: "Hotel",
  generic: "Negocio local",
};

type GeneratorForm = {
  businessName: string;
  category: string;
  city: string;
  description: string;
  currentWebsite: string;
  phone: string;
  email: string;
  whatsapp: string;
  address: string;
  goal: GoalOption["value"];
  selectedProblems: string[];
};

const initialForm: GeneratorForm = {
  businessName: "Trattoria Nova",
  category: "restaurant",
  city: "Madrid",
  description: "Restaurante italiano con cocina mediterranea y servicio para reservas.",
  currentWebsite: "https://negocio-demo.com",
  phone: "+34 911 222 333",
  email: "hola@negocio-demo.com",
  whatsapp: "+34 611 222 333",
  address: "Calle Mayor 14, Madrid",
  goal: "reservas",
  selectedProblems: ["web antigua", "sin reservas online", "mala experiencia móvil"],
};

function pickTemplateId(category: string, goal: GoalOption["value"]) {
  if (category === "restaurant" || goal === "reservas") {
    return "restaurant-demo";
  }

  if (category === "clinic" || goal === "citas" || goal === "llamadas") {
    return "clinic-demo";
  }

  if (category === "barbershop" || goal === "whatsapp") {
    return "barbershop-demo";
  }

  if (goal === "ventas") {
    return "restaurant-demo";
  }

  return "clinic-demo";
}

function buildPreviewWebsite(form: GeneratorForm): GeneratedWebsite {
  const selectedGoal = goalOptions.find((goal) => goal.value === form.goal) ?? goalOptions[0];
  const templateId = pickTemplateId(form.category, form.goal);
  const base = generatedWebsiteMocksById[templateId] ?? generatedWebsiteMocksById["restaurant-demo"];

  return {
    ...base,
    leadId: "lead_preview_dynamic",
    businessProfile: {
      ...base.businessProfile,
      businessName: form.businessName || base.businessProfile.businessName,
      category: form.category,
      city: form.city || base.businessProfile.city,
      targetCustomer:
        base.businessProfile.businessType === "clinic"
          ? "Pacientes que valoran confianza y claridad en tratamientos."
          : base.businessProfile.businessType === "barbershop"
            ? "Clientes que buscan estilo premium y experiencia personalizada."
            : "Personas que quieren una experiencia local memorable y facil de reservar.",
      mainGoal: selectedGoal.websiteGoal,
    },
    website: {
      ...base.website,
      confidence: {
        ...base.website.confidence,
        detectedProblems:
          form.selectedProblems.length > 0 ? form.selectedProblems : base.website.confidence.detectedProblems,
        salesAngle: `Estrategia centrada en ${selectedGoal.label.toLowerCase()} para convertir trafico local en oportunidades reales.`,
      },
      contact: {
        phone: form.phone || base.website.contact.phone,
        email: form.email || base.website.contact.email,
        whatsapp: form.whatsapp || base.website.contact.whatsapp,
        address: form.address || base.website.contact.address,
      },
    },
  };
}

type TextInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  multiline?: boolean;
};

function TextInput({ label, value, onChange, placeholder, multiline }: TextInputProps) {
  return (
    <label className="space-y-1.5">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</span>
      {multiline ? (
        <textarea
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full rounded-xl border border-violet-100 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-violet-500/20 transition focus:ring"
        />
      ) : (
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="w-full rounded-xl border border-violet-100 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-violet-500/20 transition focus:ring"
        />
      )}
    </label>
  );
}

export function AiGeneratorWorkbench() {
  const [form, setForm] = useState<GeneratorForm>(initialForm);
  const [mobilePreview, setMobilePreview] = useState(false);
  const [generatedWebsiteId, setGeneratedWebsiteId] = useState("");
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);

  const previewWebsite = useMemo(() => buildPreviewWebsite(form), [form]);

  const selectedGoalLabel =
    goalOptions.find((goal) => goal.value === form.goal)?.label ?? "Reservas";

  const updateForm = <K extends keyof GeneratorForm>(key: K, value: GeneratorForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
  };

  async function handlePartialRegeneration(
    endpoint:
      | "/api/ai/regenerate-style"
      | "/api/ai/regenerate-copy"
      | "/api/ai/regenerate-sections"
      | "/api/ai/regenerate-hero",
    defaultInstruction: string,
  ) {
    if (!generatedWebsiteId.trim()) {
      setActionFeedback("Introduce un generatedWebsiteId valido para usar regeneracion parcial.");
      return;
    }

    const instruction =
      window.prompt("Instrucción para IA", defaultInstruction)?.trim() ||
      defaultInstruction;

    try {
      setIsActionLoading(true);
      setActionFeedback(null);

      const currentWebsiteJson = {
        businessProfile: previewWebsite.businessProfile,
        website: {
          hero: previewWebsite.website.hero,
          sections: previewWebsite.website.sections,
        },
        seo: previewWebsite.website.seo,
        contact: previewWebsite.website.contact,
        confidence: previewWebsite.website.confidence,
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generatedWebsiteId: generatedWebsiteId.trim(),
          currentWebsiteJson,
          instruction,
        }),
      });

      const json = (await response.json()) as { error?: string };
      if (!response.ok) {
        setActionFeedback(json.error ?? "No se pudo regenerar.");
        return;
      }

      setActionFeedback("Regeneración enviada correctamente. Refresca para ver cambios persistidos.");
    } catch {
      setActionFeedback("Error inesperado en regeneración parcial.");
    } finally {
      setIsActionLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="text-2xl font-semibold tracking-tight text-slate-900">
          Generador de webs personalizadas con IA
        </h2>
        <p className="mt-2 max-w-3xl text-sm text-slate-600">
          La IA analiza cada negocio y crea una demo unica adaptada a su sector, estilo y objetivo comercial.
        </p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-2">
            <button className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white">
              <WandSparkles className="h-4 w-4" />
              Generar con IA
            </button>
            <button
              type="button"
              onClick={() =>
                handlePartialRegeneration(
                  "/api/ai/regenerate-style",
                  "Hazlo más premium y elegante",
                )
              }
              className="inline-flex items-center gap-2 rounded-xl border border-violet-100 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700"
            >
              <Palette className="h-4 w-4" />
              Regenerar estilo
            </button>
            <button
              type="button"
              onClick={() =>
                handlePartialRegeneration(
                  "/api/ai/regenerate-copy",
                  "Haz el texto más directo y comercial",
                )
              }
              className="inline-flex items-center gap-2 rounded-xl border border-violet-100 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700"
            >
              <RefreshCw className="h-4 w-4" />
              Regenerar textos
            </button>
            <button
              type="button"
              onClick={() =>
                handlePartialRegeneration(
                  "/api/ai/regenerate-sections",
                  "Añade más enfoque en reservas",
                )
              }
              className="inline-flex items-center gap-2 rounded-xl border border-violet-100 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700"
            >
              <RefreshCw className="h-4 w-4" />
              Regenerar secciones
            </button>
            <button
              type="button"
              onClick={() =>
                handlePartialRegeneration(
                  "/api/ai/regenerate-hero",
                  "Cambia el estilo a barbería vintage",
                )
              }
              className="inline-flex items-center gap-2 rounded-xl border border-violet-100 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700"
            >
              <RefreshCw className="h-4 w-4" />
              Regenerar hero
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setMobilePreview((value) => !value)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700"
            >
              {mobilePreview ? <Laptop2 className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
              Vista móvil
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700">
              <Save className="h-4 w-4" />
              Guardar demo
            </button>
            <button className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700">
              <Send className="h-4 w-4" />
              Publicar demo
            </button>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Elige el tipo de sitio
        </p>
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {categories.map((category) => {
            const isActive = form.category === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => updateForm("category", category)}
                className={`rounded-xl border p-3 text-left ${
                  isActive
                    ? "border-violet-300 bg-violet-50"
                    : "border-slate-200 bg-white hover:border-violet-200"
                }`}
              >
                <div className="mb-2 inline-flex rounded-lg bg-white p-2 shadow-sm">
                  {category === "restaurant" || category === "hotel" ? (
                    <Building2 className="h-4 w-4 text-violet-600" />
                  ) : (
                    <Home className="h-4 w-4 text-violet-600" />
                  )}
                </div>
                <p className="text-sm font-semibold text-slate-900">{categoryLabels[category]}</p>
                <p className="text-xs text-slate-500">Sitio optimizado por IA</p>
              </button>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[320px_minmax(0,1fr)_320px]">
        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-slate-900">Datos del negocio</h3>
          <div className="space-y-3">
            <TextInput label="Nombre del negocio" value={form.businessName} onChange={(value) => updateForm("businessName", value)} />

            <label className="space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Categoria</span>
              <select
                value={form.category}
                onChange={(event) => updateForm("category", event.target.value)}
                className="w-full rounded-xl border border-violet-100 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-violet-500/20 transition focus:ring"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {categoryLabels[category]}
                  </option>
                ))}
              </select>
            </label>

            <TextInput label="Ciudad" value={form.city} onChange={(value) => updateForm("city", value)} />
            <TextInput label="Descripcion" value={form.description} onChange={(value) => updateForm("description", value)} multiline />
            <TextInput label="Web actual" value={form.currentWebsite} onChange={(value) => updateForm("currentWebsite", value)} />
            <TextInput label="Telefono" value={form.phone} onChange={(value) => updateForm("phone", value)} />
            <TextInput label="Email" value={form.email} onChange={(value) => updateForm("email", value)} />
            <TextInput label="WhatsApp" value={form.whatsapp} onChange={(value) => updateForm("whatsapp", value)} />
            <TextInput label="Direccion" value={form.address} onChange={(value) => updateForm("address", value)} />

            <label className="space-y-1.5">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Objetivo principal</span>
              <select
                value={form.goal}
                onChange={(event) => updateForm("goal", event.target.value as GeneratorForm["goal"])}
                className="w-full rounded-xl border border-violet-100 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-violet-500/20 transition focus:ring"
              >
                {goalOptions.map((goal) => (
                  <option key={goal.value} value={goal.value}>
                    {goal.label}
                  </option>
                ))}
              </select>
            </label>

            <div className="space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Problemas detectados</span>
              <div className="grid gap-2">
                {detectedProblems.map((problem) => {
                  const checked = form.selectedProblems.includes(problem);
                  return (
                    <label
                      key={problem}
                      className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                    >
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() =>
                          updateForm(
                            "selectedProblems",
                            checked
                              ? form.selectedProblems.filter((item) => item !== problem)
                              : [...form.selectedProblems, problem],
                          )
                        }
                        className="h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
                      />
                      {problem}
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </aside>

        <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-semibold text-slate-900">Vista previa dinamica</h3>
            <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
              Template activo: {previewWebsite.id}
            </span>
          </div>
          <div className={`mx-auto overflow-hidden rounded-2xl border border-slate-200 bg-white ${mobilePreview ? "max-w-[390px]" : "max-w-none"}`}>
            <WebsiteRenderer data={previewWebsite} />
          </div>
        </article>

        <aside className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="mb-4 text-base font-semibold text-slate-900">Estructura del sitio</h3>
          <div className="space-y-3 text-sm text-slate-700">
            <article className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Tipo de negocio detectado</p>
              <p className="mt-1 font-medium">{previewWebsite.businessProfile.businessType}</p>
            </article>
            <article className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Cliente ideal</p>
              <p className="mt-1">{previewWebsite.businessProfile.targetCustomer}</p>
            </article>
            <article className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Objetivo principal</p>
              <p className="mt-1 font-medium">{selectedGoalLabel}</p>
            </article>
            <article className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Estilo visual elegido</p>
              <p className="mt-1 font-medium">{previewWebsite.businessProfile.visualStyle}</p>
            </article>
            <article className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Paleta de colores</p>
              <div className="mt-2 flex gap-2">
                {Object.values(previewWebsite.businessProfile.colorPalette).map((color) => (
                  <span key={color} className="h-6 w-6 rounded-full border border-slate-200" style={{ backgroundColor: color }} />
                ))}
              </div>
            </article>
            <article className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Secciones elegidas</p>
              <ul className="mt-1 space-y-1">
                {previewWebsite.website.sections.map((section) => (
                  <li key={`${section.type}-${section.order}`} className="text-sm">
                    {section.order}. {section.type}
                  </li>
                ))}
              </ul>
            </article>
            <article className="rounded-2xl border border-violet-100 bg-violet-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-violet-700">Argumento comercial</p>
              <p className="mt-1 text-violet-900">{previewWebsite.website.confidence.salesAngle}</p>
            </article>
            <label className="block space-y-1">
              <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                generatedWebsiteId (Supabase)
              </span>
              <input
                value={generatedWebsiteId}
                onChange={(event) => setGeneratedWebsiteId(event.target.value)}
                placeholder="uuid de generated_websites"
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700"
              />
            </label>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
              <Sparkles className="h-3.5 w-3.5" />
              Motor IA activo
            </div>
            {isActionLoading ? (
              <p className="text-xs text-slate-500">Regenerando con IA...</p>
            ) : null}
            {actionFeedback ? <p className="text-xs text-slate-600">{actionFeedback}</p> : null}
          </div>
        </aside>
      </section>
    </div>
  );
}
