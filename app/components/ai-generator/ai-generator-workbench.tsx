"use client";

import { useEffect, useMemo, useState } from "react";
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

type StylePresetOption = {
  id: string;
  label: string;
  instruction: string;
};

const stylePresetOptions: StylePresetOption[] = [
  { id: "premium", label: "Premium elegante", instruction: "Hazlo premium, elegante y de alto ticket con contraste limpio y visuales editoriales." },
  { id: "minimal", label: "Minimal moderno", instruction: "Hazlo minimalista moderno, con mucho aire visual, tipografía clara y bloques limpios." },
  { id: "warm", label: "Cálido mediterráneo", instruction: "Hazlo cálido mediterráneo, acogedor y gourmet, con tonos naturales y atmósfera artesanal." },
  { id: "dark", label: "Dark sofisticado", instruction: "Hazlo dark sofisticado con branding fuerte, acentos intensos y estilo premium nocturno." },
  { id: "urban", label: "Urbano enérgico", instruction: "Hazlo urbano dinámico, directo a conversión, con ritmo visual y CTAs muy visibles." },
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
  restaurantSubtype:
    | "italian"
    | "mediterranean"
    | "seafood"
    | "steakhouse"
    | "sushi"
    | "burger"
    | "vegan"
    | "fine_dining";
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

export type AiGeneratorLeadOption = {
  id: string;
  businessName: string;
  category: string;
  city: string;
  description: string;
  websiteUrl: string;
  phone: string;
  email: string;
  whatsapp: string;
  address: string;
  detectedProblems: string[];
  recommendations: string[];
  generatedWebsiteId: string | null;
  demoSlug: string | null;
};

const initialForm: GeneratorForm = {
  businessName: "Trattoria Nova",
  category: "restaurant",
  restaurantSubtype: "italian",
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

type AiGeneratorWorkbenchProps = {
  initialLeads: AiGeneratorLeadOption[];
};

type AgentWebsiteJson = {
  businessProfile: GeneratedWebsite["businessProfile"];
  website: {
    hero: GeneratedWebsite["website"]["hero"];
    sections: GeneratedWebsite["website"]["sections"];
  };
  seo: GeneratedWebsite["website"]["seo"];
  contact: GeneratedWebsite["website"]["contact"];
  confidence: GeneratedWebsite["website"]["confidence"];
};

function mapAgentJsonToGeneratedWebsite(params: {
  payload: AgentWebsiteJson;
  generatedWebsiteId: string;
  leadId: string;
}): GeneratedWebsite {
  return {
    id: params.generatedWebsiteId,
    leadId: params.leadId,
    businessProfile: params.payload.businessProfile,
    website: {
      hero: params.payload.website.hero,
      sections: params.payload.website.sections,
      seo: params.payload.seo,
      contact: params.payload.contact,
      confidence: params.payload.confidence,
    },
  };
}

function buildFormFromLead(lead: AiGeneratorLeadOption | null): GeneratorForm {
  if (!lead) return initialForm;
  return {
    businessName: lead.businessName || initialForm.businessName,
    category: normalizeCategory(lead.category),
    restaurantSubtype: initialForm.restaurantSubtype,
    city: lead.city || initialForm.city,
    description: lead.description || initialForm.description,
    currentWebsite: lead.websiteUrl || initialForm.currentWebsite,
    phone: lead.phone || initialForm.phone,
    email: lead.email || initialForm.email,
    whatsapp: lead.whatsapp || initialForm.whatsapp,
    address: lead.address || initialForm.address,
    goal: mapGoalByCategory(lead.category),
    selectedProblems:
      lead.detectedProblems.length > 0
        ? lead.detectedProblems
        : initialForm.selectedProblems,
  };
}

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

const restaurantStyleBySubtype: Record<
  GeneratorForm["restaurantSubtype"],
  { visualStyle: GeneratedWebsite["businessProfile"]["visualStyle"]; toneHint: string }
> = {
  italian: { visualStyle: "mediterranean", toneHint: "tradicion italiana, calido y familiar" },
  mediterranean: { visualStyle: "warm_restaurant", toneHint: "fresco mediterraneo, luminoso y natural" },
  seafood: { visualStyle: "mediterranean", toneHint: "marino premium, producto fresco y reservas" },
  steakhouse: { visualStyle: "premium_dark", toneHint: "parrilla premium, contundente y elegante" },
  sushi: { visualStyle: "modern_minimal", toneHint: "minimal japones, limpio y premium" },
  burger: { visualStyle: "urban", toneHint: "urbano, directo y joven" },
  vegan: { visualStyle: "natural", toneHint: "natural, eco y cercano" },
  fine_dining: { visualStyle: "luxury", toneHint: "alta cocina, elegante y sofisticado" },
};

function mapGoalByCategory(category: string): GoalOption["value"] {
  const value = category.toLowerCase();
  if (value.includes("rest")) return "reservas";
  if (value.includes("clinic") || value.includes("dental") || value.includes("beauty")) {
    return "citas";
  }
  if (value.includes("barber")) return "whatsapp";
  if (value.includes("shop") || value.includes("tienda")) return "ventas";
  if (value.includes("hotel")) return "reservas";
  return "leads";
}

function normalizeCategory(category: string): string {
  const value = category.toLowerCase();
  if (value.includes("rest")) return "restaurant";
  if (value.includes("clinic") || value.includes("dental")) return "clinic";
  if (value.includes("barber")) return "barbershop";
  if (value.includes("beauty") || value.includes("pelu")) return "beauty";
  if (value.includes("shop") || value.includes("tienda")) return "shop";
  if (value.includes("hotel")) return "hotel";
  if (value.includes("fitness") || value.includes("gym")) return "fitness";
  return "generic";
}

function buildPreviewWebsite(form: GeneratorForm): GeneratedWebsite {
  const selectedGoal = goalOptions.find((goal) => goal.value === form.goal) ?? goalOptions[0];
  const templateId = pickTemplateId(form.category, form.goal);
  const base = generatedWebsiteMocksById[templateId] ?? generatedWebsiteMocksById["restaurant-demo"];
  const restaurantStyle =
    form.category === "restaurant" ? restaurantStyleBySubtype[form.restaurantSubtype] : null;

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
      visualStyle: restaurantStyle?.visualStyle ?? base.businessProfile.visualStyle,
      tone:
        form.category === "restaurant" && restaurantStyle
          ? `Comercial premium con enfoque en ${restaurantStyle.toneHint}`
          : base.businessProfile.tone,
    },
    website: {
      ...base.website,
      confidence: {
        ...base.website.confidence,
        detectedProblems:
          form.selectedProblems.length > 0 ? form.selectedProblems : base.website.confidence.detectedProblems,
        salesAngle:
          form.category === "restaurant" && restaurantStyle
            ? `Estrategia de ${form.restaurantSubtype.replace("_", " ")} centrada en ${selectedGoal.label.toLowerCase()} y diferenciación visual.`
            : `Estrategia centrada en ${selectedGoal.label.toLowerCase()} para convertir trafico local en oportunidades reales.`,
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

export function AiGeneratorWorkbench({ initialLeads }: AiGeneratorWorkbenchProps) {
  const [form, setForm] = useState<GeneratorForm>(() => buildFormFromLead(initialLeads[0] ?? null));
  const [mobilePreview, setMobilePreview] = useState(false);
  const [generatedWebsiteId, setGeneratedWebsiteId] = useState(initialLeads[0]?.generatedWebsiteId ?? "");
  const [selectedLeadId, setSelectedLeadId] = useState(initialLeads[0]?.id ?? "");
  const [isActionLoading, setIsActionLoading] = useState(false);
  const [actionFeedback, setActionFeedback] = useState<string | null>(null);
  const [apiPreviewWebsite, setApiPreviewWebsite] = useState<GeneratedWebsite | null>(null);
  const [selectedStylePresetId, setSelectedStylePresetId] = useState(stylePresetOptions[0].id);
  const [customStyleInstruction, setCustomStyleInstruction] = useState("");

  const previewWebsite = useMemo(
    () => apiPreviewWebsite ?? buildPreviewWebsite(form),
    [apiPreviewWebsite, form],
  );
  const selectedLead = useMemo(
    () => initialLeads.find((lead) => lead.id === selectedLeadId) ?? null,
    [initialLeads, selectedLeadId],
  );

  const selectedGoalLabel =
    goalOptions.find((goal) => goal.value === form.goal)?.label ?? "Reservas";
  const primaryBusinessObjectiveLabel = `Mejorar negocio online (enfoque: ${selectedGoalLabel.toLowerCase()})`;
  const selectedStylePreset =
    stylePresetOptions.find((preset) => preset.id === selectedStylePresetId) ?? stylePresetOptions[0];
  const resolvedStyleInstruction =
    customStyleInstruction.trim().length >= 3
      ? customStyleInstruction.trim()
      : selectedStylePreset.instruction;

  const updateForm = <K extends keyof GeneratorForm>(key: K, value: GeneratorForm[K]) => {
    setForm((current) => ({ ...current, [key]: value }));
    setApiPreviewWebsite(null);
  };

  async function syncPreviewFromGeneratedWebsite(
    nextGeneratedWebsiteId: string,
    leadIdForPreview: string,
  ) {
    const currentResponse = await fetch(`/api/generated-websites/${nextGeneratedWebsiteId}`);
    if (!currentResponse.ok) return;
    const currentData = (await currentResponse.json()) as {
      currentWebsiteJson?: AgentWebsiteJson;
    };
    if (!currentData.currentWebsiteJson) return;
    setApiPreviewWebsite(
      mapAgentJsonToGeneratedWebsite({
        payload: currentData.currentWebsiteJson,
        generatedWebsiteId: nextGeneratedWebsiteId,
        leadId: leadIdForPreview,
      }),
    );
  }

  async function handleSelectLead(leadId: string) {
    setSelectedLeadId(leadId);
    const lead = initialLeads.find((item) => item.id === leadId) ?? null;
    setForm(buildFormFromLead(lead));
    setGeneratedWebsiteId(lead?.generatedWebsiteId ?? "");
    setApiPreviewWebsite(null);
    setActionFeedback(null);

    if (lead?.generatedWebsiteId) {
      await syncPreviewFromGeneratedWebsite(lead.generatedWebsiteId, lead.id);
    }
  }

  useEffect(() => {
    const first = initialLeads[0];
    if (!first?.generatedWebsiteId) return;
    void syncPreviewFromGeneratedWebsite(first.generatedWebsiteId, first.id);
  }, [initialLeads]);

  async function handleGenerateWithAI() {
    if (!selectedLead) {
      setActionFeedback("Selecciona un negocio encontrado para generar la demo.");
      return;
    }

    try {
      setIsActionLoading(true);
      setActionFeedback(null);
      const selectedGoal = goalOptions.find((goal) => goal.value === form.goal) ?? goalOptions[0];

      const response = await fetch("/api/agent/generate-website", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: selectedLead.id,
          businessName: form.businessName,
          category: form.category,
          city: form.city,
          description:
            form.category === "restaurant"
              ? `${form.description}\n\nRestaurant subtype: ${form.restaurantSubtype}.`
              : form.description,
          phone: form.phone,
          email: form.email,
          whatsapp: form.whatsapp,
          address: form.address,
          websiteUrl: form.currentWebsite,
          detectedProblems: form.selectedProblems,
          recommendations: selectedLead.recommendations,
          targetGoal: selectedGoal.websiteGoal,
        }),
      });

      const json = (await response.json()) as {
        error?: string;
        generatedWebsiteId?: string;
        demoSlug?: string;
        mode?: "live_agent" | "mock_fallback";
      } & Partial<AgentWebsiteJson>;

      if (!response.ok) {
        setActionFeedback(json.error ?? "No se pudo generar la web con IA.");
        return;
      }

      if (json.generatedWebsiteId) {
        setGeneratedWebsiteId(json.generatedWebsiteId);
        if (json.businessProfile && json.website && json.seo && json.contact && json.confidence) {
          setApiPreviewWebsite(
            mapAgentJsonToGeneratedWebsite({
              payload: {
                businessProfile: json.businessProfile,
                website: json.website,
                seo: json.seo,
                contact: json.contact,
                confidence: json.confidence,
              },
              generatedWebsiteId: json.generatedWebsiteId,
              leadId: selectedLead.id,
            }),
          );
        } else {
          await syncPreviewFromGeneratedWebsite(json.generatedWebsiteId, selectedLead.id);
        }
      }
      setActionFeedback(
        json.mode === "mock_fallback"
          ? "Demo generada en modo mock_fallback (resultado básico). Revisa OPENAI_API_KEY para calidad premium."
          : json.demoSlug
            ? `Demo generada correctamente con IA. URL: /demo/${json.demoSlug}`
            : "Demo generada correctamente con IA.",
      );
    } catch {
      setActionFeedback("Error inesperado al generar la demo con IA.");
    } finally {
      setIsActionLoading(false);
    }
  }

  async function handleFullPipeline() {
    if (!selectedLead) {
      setActionFeedback("Selecciona un negocio para ejecutar pipeline.");
      return;
    }
    try {
      setIsActionLoading(true);
      setActionFeedback(null);
      const response = await fetch("/api/intelligence/full-pipeline", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leadId: selectedLead.id,
          instruction: resolvedStyleInstruction,
        }),
      });
      const json = (await response.json()) as {
        error?: string;
        generatedWebsiteId?: string;
        demoSlug?: string;
      };
      if (!response.ok) {
        setActionFeedback(json.error ?? "No se pudo ejecutar el pipeline completo.");
        return;
      }
      if (json.generatedWebsiteId) {
        setGeneratedWebsiteId(json.generatedWebsiteId);
        await syncPreviewFromGeneratedWebsite(json.generatedWebsiteId, selectedLead.id);
      }
      setActionFeedback(
        json.demoSlug
          ? `Pipeline completado. Demo: /demo/${json.demoSlug}`
          : "Pipeline completado correctamente.",
      );
    } catch {
      setActionFeedback("Error inesperado en pipeline completo.");
    } finally {
      setIsActionLoading(false);
    }
  }

  async function handleSaveDemo() {
    if (!generatedWebsiteId.trim()) {
      setActionFeedback("Primero genera una demo para obtener generatedWebsiteId.");
      return;
    }

    try {
      setIsActionLoading(true);
      setActionFeedback(null);
      const response = await fetch(`/api/generated-websites/${generatedWebsiteId.trim()}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessProfile: previewWebsite.businessProfile,
          website: previewWebsite.website,
          seo: previewWebsite.website.seo,
          contact: previewWebsite.website.contact,
          confidence: previewWebsite.website.confidence,
        }),
      });
      const json = (await response.json()) as { error?: string };
      if (!response.ok) {
        setActionFeedback(json.error ?? "No se pudo guardar la demo.");
        return;
      }
      setActionFeedback("Demo guardada en Supabase.");
      if (selectedLeadId) {
        await syncPreviewFromGeneratedWebsite(generatedWebsiteId.trim(), selectedLeadId);
      }
    } catch {
      setActionFeedback("Error inesperado al guardar la demo.");
    } finally {
      setIsActionLoading(false);
    }
  }

  async function handlePublishDemo() {
    if (!generatedWebsiteId.trim()) {
      setActionFeedback("Primero genera una demo para poder publicarla.");
      return;
    }

    try {
      setIsActionLoading(true);
      setActionFeedback(null);

      const publishResponse = await fetch(`/api/generated-websites/${generatedWebsiteId.trim()}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });
      const publishJson = (await publishResponse.json()) as { error?: string };
      if (!publishResponse.ok) {
        setActionFeedback(publishJson.error ?? "No se pudo publicar la demo.");
        return;
      }

      if (selectedLeadId) {
        await fetch("/api/leads/update-status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ leadId: selectedLeadId, status: "approved" }),
        });
      }
      setActionFeedback("Demo publicada y lead marcado como aprobado.");
    } catch {
      setActionFeedback("Error inesperado al publicar la demo.");
    } finally {
      setIsActionLoading(false);
    }
  }

  async function handlePartialRegeneration(
    mode: "style" | "copy" | "sections" | "hero",
    defaultInstruction: string,
    options?: { skipPrompt?: boolean; overrideInstruction?: string },
  ) {
    if (!generatedWebsiteId.trim()) {
      setActionFeedback("Introduce un generatedWebsiteId valido para usar regeneracion parcial.");
      return;
    }

    const instruction = options?.skipPrompt
      ? options.overrideInstruction?.trim() || defaultInstruction
      : window.prompt("Instrucción para IA", defaultInstruction)?.trim() || defaultInstruction;

    try {
      setIsActionLoading(true);
      setActionFeedback(null);

      let currentWebsiteJson:
        | {
            businessProfile: unknown;
            website: unknown;
            seo: unknown;
            contact: unknown;
            confidence: unknown;
          }
        | null = null;

      const currentResponse = await fetch(`/api/generated-websites/${generatedWebsiteId.trim()}`);
      if (currentResponse.ok) {
        const currentData = (await currentResponse.json()) as {
          currentWebsiteJson?: {
            businessProfile: unknown;
            website: unknown;
            seo: unknown;
            contact: unknown;
            confidence: unknown;
          };
        };
        currentWebsiteJson = currentData.currentWebsiteJson ?? null;
      }

      if (!currentWebsiteJson) {
        setActionFeedback(
          "No se pudo cargar la web actual desde Supabase. Genera y guarda una demo antes de regenerar.",
        );
        return;
      }

      const regenerateEndpointByMode = {
        style: "/api/ai/regenerate-style",
        copy: "/api/ai/regenerate-copy",
        sections: "/api/ai/regenerate-sections",
        hero: "/api/ai/regenerate-hero",
      } as const;

      const response = await fetch(regenerateEndpointByMode[mode], {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          generatedWebsiteId: generatedWebsiteId.trim(),
          currentWebsiteJson,
          instruction,
        }),
      });

      const json = (await response.json()) as (Partial<AgentWebsiteJson> & {
        error?: string;
      });
      if (!response.ok) {
        setActionFeedback(json.error ?? "No se pudo regenerar.");
        return;
      }

      if (json.businessProfile && json.website && json.seo && json.contact && json.confidence) {
        setApiPreviewWebsite(
          mapAgentJsonToGeneratedWebsite({
            payload: {
              businessProfile: json.businessProfile,
              website: json.website,
              seo: json.seo,
              contact: json.contact,
              confidence: json.confidence,
            },
            generatedWebsiteId: generatedWebsiteId.trim(),
            leadId: selectedLeadId || "lead_preview_dynamic",
          }),
        );
      } else if (selectedLeadId) {
        await syncPreviewFromGeneratedWebsite(generatedWebsiteId.trim(), selectedLeadId);
      }

      setActionFeedback("Regeneración aplicada con IA y vista previa actualizada.");
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
            <button
              type="button"
              onClick={handleGenerateWithAI}
              disabled={isActionLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <WandSparkles className="h-4 w-4" />
              Generar con IA
            </button>
            <button
              type="button"
              onClick={handleFullPipeline}
              disabled={isActionLoading}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-700 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-60"
            >
              <WandSparkles className="h-4 w-4" />
              Pipeline completo
            </button>
            <button
              type="button"
              onClick={() =>
                handlePartialRegeneration(
                  "style",
                  resolvedStyleInstruction,
                  { skipPrompt: true, overrideInstruction: resolvedStyleInstruction },
                )
              }
              disabled={isActionLoading}
              className="inline-flex items-center gap-2 rounded-xl border border-violet-100 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700"
            >
              <Palette className="h-4 w-4" />
              Regenerar estilo
            </button>
            <button
              type="button"
              onClick={() =>
                handlePartialRegeneration(
                  "copy",
                  "Haz el texto más directo y comercial",
                )
              }
              disabled={isActionLoading}
              className="inline-flex items-center gap-2 rounded-xl border border-violet-100 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700"
            >
              <RefreshCw className="h-4 w-4" />
              Regenerar textos
            </button>
            <button
              type="button"
              onClick={() =>
                handlePartialRegeneration(
                  "sections",
                  "Añade más enfoque en reservas",
                )
              }
              disabled={isActionLoading}
              className="inline-flex items-center gap-2 rounded-xl border border-violet-100 bg-violet-50 px-4 py-2 text-sm font-medium text-violet-700"
            >
              <RefreshCw className="h-4 w-4" />
              Regenerar secciones
            </button>
            <button
              type="button"
              onClick={() =>
                handlePartialRegeneration(
                  "hero",
                  "Cambia el estilo a barbería vintage",
                )
              }
              disabled={isActionLoading}
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
            <button
              type="button"
              onClick={handleSaveDemo}
              disabled={isActionLoading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Save className="h-4 w-4" />
              Guardar demo
            </button>
            <button
              type="button"
              onClick={handlePublishDemo}
              disabled={isActionLoading}
              className="inline-flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Send className="h-4 w-4" />
              Publicar demo
            </button>
          </div>
        </div>
        <div className="mt-3 grid gap-3 rounded-xl border border-violet-100 bg-violet-50/50 p-3 md:grid-cols-[220px_minmax(0,1fr)]">
          <label className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Estilo sugerido
            </span>
            <select
              value={selectedStylePresetId}
              onChange={(event) => setSelectedStylePresetId(event.target.value)}
              className="w-full rounded-lg border border-violet-200 bg-white px-3 py-2 text-sm text-slate-900"
            >
              {stylePresetOptions.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.label}
                </option>
              ))}
            </select>
          </label>
          <label className="space-y-1">
            <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              Instrucción personalizada (opcional)
            </span>
            <input
              value={customStyleInstruction}
              onChange={(event) => setCustomStyleInstruction(event.target.value)}
              placeholder={selectedStylePreset.instruction}
              className="w-full rounded-lg border border-violet-200 bg-white px-3 py-2 text-sm text-slate-900"
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="mb-4 grid gap-3 rounded-2xl border border-violet-100 bg-violet-50/60 p-3 md:grid-cols-[minmax(0,1fr)_auto] md:items-end">
          <label className="space-y-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Negocio encontrado
            </span>
            <select
              value={selectedLeadId}
              onChange={(event) => handleSelectLead(event.target.value)}
              className="w-full rounded-xl border border-violet-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-violet-500/20 transition focus:ring"
            >
              {initialLeads.length === 0 ? (
                <option value="">Sin negocios disponibles</option>
              ) : null}
              {initialLeads.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.businessName} - {lead.city} ({lead.category})
                </option>
              ))}
            </select>
          </label>
          <div className="text-xs text-slate-600">
            {selectedLead?.generatedWebsiteId ? (
              <p>
                Demo existente detectada. ID:{" "}
                <span className="font-semibold">{selectedLead.generatedWebsiteId}</span>
              </p>
            ) : (
              <p>Este negocio aun no tiene demo guardada.</p>
            )}
          </div>
        </div>
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

            {form.category === "restaurant" ? (
              <label className="space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Tipo de restaurante
                </span>
                <select
                  value={form.restaurantSubtype}
                  onChange={(event) =>
                    updateForm(
                      "restaurantSubtype",
                      event.target.value as GeneratorForm["restaurantSubtype"],
                    )
                  }
                  className="w-full rounded-xl border border-violet-100 bg-white px-3 py-2 text-sm text-slate-900 outline-none ring-violet-500/20 transition focus:ring"
                >
                  <option value="italian">Italiano</option>
                  <option value="mediterranean">Mediterraneo</option>
                  <option value="seafood">Marisqueria / Pescado</option>
                  <option value="steakhouse">Parrilla / Carne</option>
                  <option value="sushi">Sushi</option>
                  <option value="burger">Burger</option>
                  <option value="vegan">Vegano</option>
                  <option value="fine_dining">Fine dining</option>
                </select>
              </label>
            ) : null}

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
            <div className="text-right">
              <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">
                {apiPreviewWebsite ? "Demo IA activa" : "Preview previa a generar"}
              </span>
              {generatedWebsiteId.trim() ? (
                <p className="mt-1 text-[11px] text-slate-500">ID: {generatedWebsiteId.trim()}</p>
              ) : null}
            </div>
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
              <p className="mt-1 font-medium">{primaryBusinessObjectiveLabel}</p>
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
