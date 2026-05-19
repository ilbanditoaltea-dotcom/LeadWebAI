import { applyChannelLengthRules } from "@/src/lib/ai/generate-sales-message";
import type { GenerateCustomWebsiteOutput } from "@/src/lib/ai/generate-custom-website";
import { generatedWebsiteMocksById } from "@/src/lib/types/ai-website";
import type {
  AgentAnalyzeBusinessInput,
  AgentAnalyzeBusinessOutput,
  AgentGenerateMessageInput,
  AgentGenerateMessageOutput,
  AgentGenerateWebsiteInput,
  AgentGenerateWebsiteOutput,
  AgentMode,
  AgentNextActionInput,
  AgentNextActionOutput,
  AgentRegenerateWebsiteInput,
  AgentRegenerateWebsiteOutput,
} from "@/src/lib/agent/types";

function resolveMode(): AgentMode {
  const apiKey = process.env.OPENAI_API_KEY;
  const agentId = process.env.OPENAI_AGENT_ID;
  if (apiKey && apiKey.startsWith("sk-") && agentId && agentId.trim().length > 0) {
    return "live_agent";
  }
  return "mock_fallback";
}

function normalizeBusinessType(category: string) {
  const lower = category.toLowerCase();
  if (lower.includes("rest")) return "restaurant" as const;
  if (lower.includes("clinic") || lower.includes("dental")) return "clinic" as const;
  if (lower.includes("barber")) return "barbershop" as const;
  if (lower.includes("beauty") || lower.includes("pelu")) return "beauty" as const;
  if (lower.includes("real") || lower.includes("inmobili")) return "real_estate" as const;
  if (lower.includes("academy") || lower.includes("english") || lower.includes("escuela")) return "academy" as const;
  if (lower.includes("hotel")) return "hotel" as const;
  if (lower.includes("shop") || lower.includes("tienda")) return "shop" as const;
  if (lower.includes("auto") || lower.includes("motor") || lower.includes("taller")) return "automotive" as const;
  return "generic" as const;
}

function goalByBusinessType(type: ReturnType<typeof normalizeBusinessType>) {
  if (type === "restaurant" || type === "hotel") return "get_reservations" as const;
  if (type === "clinic" || type === "beauty" || type === "barbershop") return "get_appointments" as const;
  if (type === "automotive") return "get_calls" as const;
  if (type === "shop") return "sell_products" as const;
  if (type === "academy" || type === "real_estate") return "capture_leads" as const;
  return "promote_services" as const;
}

function templateForCategory(category: string) {
  const type = normalizeBusinessType(category);
  if (type === "restaurant") return generatedWebsiteMocksById["restaurant-demo"];
  if (type === "clinic") return generatedWebsiteMocksById["clinic-demo"];
  return generatedWebsiteMocksById["barbershop-demo"];
}

function normalizeSectionsForAgentWebsite(
  sections: typeof generatedWebsiteMocksById["restaurant-demo"]["website"]["sections"],
): GenerateCustomWebsiteOutput["website"]["sections"] {
  return sections
    .filter((section) => section.type !== "hero")
    .map((section) => ({
      type: section.type === "hero" ? "services" : section.type,
      variant: section.variant,
      title: section.title,
      subtitle: section.subtitle,
      imagePrompt: section.imagePrompt ?? "unknown",
      imageAlt: section.imageAlt ?? "Imagen sugerida por IA",
      items: section.items,
      cta: section.cta,
      order: section.order,
    })) as GenerateCustomWebsiteOutput["website"]["sections"];
}

export async function analyzeBusinessWithAgent(
  input: AgentAnalyzeBusinessInput,
): Promise<AgentAnalyzeBusinessOutput> {
  const mode = resolveMode();
  const businessType = normalizeBusinessType(input.category ?? "generic");
  const mainGoal = goalByBusinessType(businessType);
  const hasWebsite = Boolean(input.websiteUrl && input.websiteUrl !== "unknown");
  return {
    mode,
    businessType,
    opportunityScore: hasWebsite ? 74 : 82,
    websiteQualityScore: hasWebsite ? 57 : 35,
    targetCustomer: `Local customers in ${input.city ?? "unknown"}`,
    mainGoal,
    detectedProblems: [
      "Primary CTA is not clear on first screen.",
      "Mobile conversion path can be simplified.",
      "Social proof is limited or not visible enough.",
    ],
    recommendations: [
      "Create a conversion-first hero with immediate CTA.",
      "Add trust blocks (reviews/cases) near the fold.",
      "Reduce friction to booking/contact from mobile.",
    ],
    salesAngle: "Deliver a premium demo focused on measurable monthly growth.",
    suggestedMonthlyPlan: {
      name: "Growth Local",
      price: "127 EUR/month",
      reason: "Monthly optimization for conversion and local visibility.",
      features: [
        "Conversion improvements",
        "Local SEO optimization",
        "Content and UX updates",
      ],
    },
  };
}

export async function generateWebsiteWithAgent(
  input: AgentGenerateWebsiteInput,
): Promise<AgentGenerateWebsiteOutput> {
  const mode = resolveMode();
  const base = templateForCategory(input.category ?? "generic");
  return {
    mode,
    businessProfile: {
      ...base.businessProfile,
      businessName: input.businessName,
      category: input.category ?? "generic",
      city: input.city ?? "unknown",
      mainGoal: input.targetGoal,
    },
    website: {
      ...base.website,
      sections: normalizeSectionsForAgentWebsite(base.website.sections),
      hero: {
        ...base.website.hero,
        title: `${input.businessName}: web orientada a conversión`,
        subtitle:
          "Propuesta demo personalizada para captar más clientes desde móvil y desktop.",
      },
    },
    seo: {
      ...base.website.seo,
      title: `${input.businessName} | Demo web personalizada`,
      description: `Demo comercial para ${input.businessName} en ${input.city ?? "unknown"}.`,
    },
    contact: {
      phone: input.phone,
      email: input.email,
      whatsapp: input.whatsapp,
      address: input.address,
    },
    confidence: {
      ...base.website.confidence,
      detectedProblems:
        input.detectedProblems.length > 0
          ? input.detectedProblems
          : base.website.confidence.detectedProblems,
      recommendedFeatures:
        input.recommendations.length > 0
          ? input.recommendations
          : base.website.confidence.recommendedFeatures,
    },
  };
}

export async function regenerateWebsiteWithAgent(
  input: AgentRegenerateWebsiteInput,
): Promise<AgentRegenerateWebsiteOutput> {
  const mode = resolveMode();
  const current = input.currentWebsiteJson;
  if (input.mode === "style") {
    return {
      ...current,
      mode,
      businessProfile: {
        ...current.businessProfile,
        tone: `${current.businessProfile.tone} | ${input.instruction}`,
      },
    };
  }
  if (input.mode === "copy") {
    return {
      ...current,
      mode,
      website: {
        ...current.website,
        hero: {
          ...current.website.hero,
          subtitle: `${current.website.hero.subtitle} (${input.instruction})`,
        },
      },
      confidence: {
        ...current.confidence,
        salesAngle: `${current.confidence.salesAngle} (${input.instruction})`,
      },
    };
  }
  if (input.mode === "hero") {
    return {
      ...current,
      mode,
      website: {
        ...current.website,
        hero: {
          ...current.website.hero,
          title: `${current.website.hero.title} - updated`,
        },
      },
    };
  }
  return { ...current, mode };
}

export async function generateMessageWithAgent(
  input: AgentGenerateMessageInput,
): Promise<AgentGenerateMessageOutput> {
  const mode = resolveMode();
  const businessName = input.lead.businessName ?? input.lead.business_name ?? "este negocio";
  const detected = input.lead.detectedProblems ?? input.lead.detected_problems ?? [];
  const demoUrl =
    input.generatedWebsite?.demoUrl ??
    (input.generatedWebsite?.demo_slug
      ? `/demo/${input.generatedWebsite.demo_slug}`
      : input.generatedWebsite?.id
        ? `/demo/${input.generatedWebsite.id}`
        : "unknown");
  const base: AgentGenerateMessageOutput = {
    mode,
    channel: input.channel,
    subject: `Demo personalizada para ${businessName}`,
    body:
      `Hola equipo de ${businessName}, hemos detectado ${detected.slice(0, 2).join(" y ") || "oportunidades claras de mejora digital"}. ` +
      `Preparamos una demo visual para aumentar conversión y facilitar contacto: ${demoUrl}. ` +
      "Si os encaja, la revisamos en una llamada breve esta semana.",
    personalizationPoints: [input.lead.city ?? "unknown", input.lead.category ?? "unknown"],
    mainSalesAngle: "Propuesta mensual de mejora digital con foco en conversión.",
    cta: "¿Te va bien revisarla esta semana?",
    riskNotes: ["No se prometen resultados garantizados."],
  };
  const safe = applyChannelLengthRules(base);
  return { ...safe, mode };
}

export async function getNextActionWithAgent(
  input: AgentNextActionInput,
): Promise<AgentNextActionOutput> {
  const mode = resolveMode();
  if (!input.status || input.status === "new") {
    return { mode, nextAction: "analyze_business", reason: "Lead not analyzed yet.", priority: "high" };
  }
  if (!input.hasGeneratedWebsite) {
    return { mode, nextAction: "generate_website", reason: "Lead needs a personalized demo.", priority: "high" };
  }
  if (!input.hasMessage) {
    return { mode, nextAction: "generate_message", reason: "Sales message is missing.", priority: "medium" };
  }
  if (input.status === "pending_approval") {
    return { mode, nextAction: "approve_and_contact", reason: "Demo and message are ready for manual approval.", priority: "high" };
  }
  return { mode, nextAction: "follow_up", reason: "Continue campaign follow-up cadence.", priority: "medium" };
}
