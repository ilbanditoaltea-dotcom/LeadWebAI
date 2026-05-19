import OpenAI from "openai";
import { applyChannelLengthRules } from "@/src/lib/ai/generate-sales-message";
import {
  generateCustomWebsiteOutputSchema,
  type GenerateCustomWebsiteOutput,
} from "@/src/lib/ai/generate-custom-website";
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
  if (apiKey && apiKey.startsWith("sk-")) {
    return "live_agent";
  }
  return "mock_fallback";
}

function getOpenAiClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || !apiKey.startsWith("sk-")) {
    throw new Error("OPENAI_API_KEY missing or invalid.");
  }
  return new OpenAI({ apiKey });
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

type RestaurantConcept = {
  key: "italian" | "seafood" | "steakhouse" | "sushi" | "vegan" | "burger";
  visualStyle: GenerateCustomWebsiteOutput["businessProfile"]["visualStyle"];
  tone: string;
  heroTitle: string;
  heroSubtitle: string;
  eyebrow: string;
  primaryCTA: string;
  secondaryCTA: string;
  menuItems: Array<{ name: string; price: string; tag: string }>;
  palette: GenerateCustomWebsiteOutput["businessProfile"]["colorPalette"];
};

function inferRestaurantConcept(input: AgentGenerateWebsiteInput): RestaurantConcept {
  const context = `${input.businessName} ${input.category} ${input.description}`.toLowerCase();
  if (context.includes("sushi") || context.includes("japon")) {
    return {
      key: "sushi",
      visualStyle: "modern_minimal",
      tone: "Minimal, premium, precise",
      heroTitle: "Refined sushi experience with modern elegance",
      heroSubtitle: "Omakase moments, curated nigiri and clean design for higher reservation conversion.",
      eyebrow: "Japanese kitchen",
      primaryCTA: "Book tasting",
      secondaryCTA: "View omakase menu",
      menuItems: [
        { name: "Omakase Selection", price: "52 EUR", tag: "Chef experience" },
        { name: "Nigiri Premium Set", price: "32 EUR", tag: "Best seller" },
        { name: "Salmon Tataki", price: "18 EUR", tag: "Fresh catch" },
      ],
      palette: {
        primary: "#0F172A",
        secondary: "#38BDF8",
        background: "#F8FAFC",
        text: "#0F172A",
        accent: "#EF4444",
      },
    };
  }
  if (context.includes("pescado") || context.includes("marisco") || context.includes("seafood")) {
    return {
      key: "seafood",
      visualStyle: "mediterranean",
      tone: "Fresh, coastal, premium",
      heroTitle: "Fresh seafood and Mediterranean flavor by the day",
      heroSubtitle: "Daily catch, rice dishes and a bright atmosphere designed to drive online reservations.",
      eyebrow: "Seafood house",
      primaryCTA: "Book your table",
      secondaryCTA: "See fish menu",
      menuItems: [
        { name: "Grilled Sea Bass", price: "24 EUR", tag: "Daily catch" },
        { name: "Seafood Rice", price: "21 EUR", tag: "House specialty" },
        { name: "Red Prawn Carpaccio", price: "19 EUR", tag: "Signature" },
      ],
      palette: {
        primary: "#0369A1",
        secondary: "#0EA5E9",
        background: "#F0F9FF",
        text: "#0F172A",
        accent: "#F59E0B",
      },
    };
  }
  if (context.includes("carne") || context.includes("parrilla") || context.includes("steak")) {
    return {
      key: "steakhouse",
      visualStyle: "premium_dark",
      tone: "Bold, warm, upscale",
      heroTitle: "Prime cuts and fire-grill flavor done right",
      heroSubtitle: "Steakhouse positioning with premium visuals and direct booking flow to fill peak hours.",
      eyebrow: "Steakhouse",
      primaryCTA: "Reserve dinner",
      secondaryCTA: "View grill menu",
      menuItems: [
        { name: "Ribeye 400g", price: "34 EUR", tag: "Top cut" },
        { name: "Dry-aged Sirloin", price: "29 EUR", tag: "Chef recommendation" },
        { name: "Grill Tasting Board", price: "48 EUR", tag: "To share" },
      ],
      palette: {
        primary: "#7F1D1D",
        secondary: "#F59E0B",
        background: "#111827",
        text: "#F8FAFC",
        accent: "#DC2626",
      },
    };
  }
  if (context.includes("vegano") || context.includes("vegan")) {
    return {
      key: "vegan",
      visualStyle: "natural",
      tone: "Natural, healthy, modern",
      heroTitle: "Plant-based cuisine crafted for modern city life",
      heroSubtitle: "Healthy bowls, creative mains and a conversion-focused web experience.",
      eyebrow: "Vegan kitchen",
      primaryCTA: "Book now",
      secondaryCTA: "See plant-based menu",
      menuItems: [
        { name: "Green Power Bowl", price: "15 EUR", tag: "Popular" },
        { name: "Tofu Teriyaki Plate", price: "17 EUR", tag: "Protein rich" },
        { name: "Raw Cacao Dessert", price: "8 EUR", tag: "No refined sugar" },
      ],
      palette: {
        primary: "#166534",
        secondary: "#4ADE80",
        background: "#F7FEE7",
        text: "#14532D",
        accent: "#EAB308",
      },
    };
  }
  if (context.includes("burger")) {
    return {
      key: "burger",
      visualStyle: "urban",
      tone: "Urban, energetic, direct",
      heroTitle: "Smash burgers with bold flavor and fast booking",
      heroSubtitle: "Street-food identity, high-impact visuals and conversion-first ordering flow.",
      eyebrow: "Burger house",
      primaryCTA: "Order or reserve",
      secondaryCTA: "See combos",
      menuItems: [
        { name: "Double Smash Classic", price: "14 EUR", tag: "Best seller" },
        { name: "Truffle Bacon Burger", price: "16 EUR", tag: "Premium" },
        { name: "Loaded Fries", price: "7 EUR", tag: "Add-on" },
      ],
      palette: {
        primary: "#4338CA",
        secondary: "#22D3EE",
        background: "#F8FAFC",
        text: "#0F172A",
        accent: "#F43F5E",
      },
    };
  }
  return {
    key: "italian",
    visualStyle: "mediterranean",
    tone: "Warm, traditional, premium",
    heroTitle: "Authentic Mediterranean flavor with a premium dining feel",
    heroSubtitle: "Fresh ingredients, crafted dishes and a smoother reservation journey.",
    eyebrow: "Mediterranean kitchen",
    primaryCTA: "Book your table",
    secondaryCTA: "View menu",
    menuItems: [
      { name: "Tagliatelle al Tartufo", price: "18 EUR", tag: "Chef pick" },
      { name: "Margherita DOP", price: "14 EUR", tag: "Classic" },
      { name: "Tiramisu della Casa", price: "7 EUR", tag: "Best seller" },
    ],
    palette: {
      primary: "#A61E1E",
      secondary: "#D9A441",
      background: "#FFF9F2",
      text: "#2E2018",
      accent: "#2C7A4B",
    },
  };
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

function regenerateModeGuidance(mode: AgentRegenerateWebsiteInput["mode"]) {
  if (mode === "style") {
    return "Focus on visual style, palette, tone and aesthetic direction. Keep conversion intent.";
  }
  if (mode === "copy") {
    return "Focus on copywriting improvements: hero, section copy, CTAs, SEO and salesAngle.";
  }
  if (mode === "sections") {
    return "Focus on section architecture and ordering. Keep 6-10 sections and include final_cta.";
  }
  return "Focus only on hero (title, subtitle, eyebrow, CTA, image prompt).";
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
  if (mode === "live_agent") {
    try {
      const openai = getOpenAiClient();
      const completion = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        temperature: 0.45,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are an elite CRO web strategist + premium visual director for local businesses. Return only valid JSON with the required schema.",
          },
          {
            role: "user",
            content: `Generate a highly specific website blueprint.
Input:
${JSON.stringify(input)}

Rules:
- DO NOT use a fixed template pattern. Build a bespoke concept from business context.
- Adapt deeply to business type and sub-type if detected from description/category (examples: seafood, steakhouse, sushi, vegan, burger, italian, etc.).
- Output ONLY this JSON schema keys: businessProfile, website, seo, contact, confidence.
- website.sections must have 6-10 sections and include final_cta.
- Use concrete, commercial copy in English.
- For restaurants, include menu-specific and atmosphere-specific messaging, not generic placeholders.
- Push premium visual quality: strong hero art direction, contrast hierarchy, refined CTA rhythm, and section storytelling.
- Hero title/subtitle must be distinctive for that specific concept (not generic growth wording).
- Section items must be realistic and niche-aware (dish/service names, pricing style, proof points, audience intent).
- Keep unknown fields as "unknown", do not invent verifiable contact facts.`,
          },
        ],
      });

      const raw = completion.choices[0]?.message?.content;
      if (raw) {
        const parsed = generateCustomWebsiteOutputSchema.safeParse(JSON.parse(raw));
        if (parsed.success) {
          return { ...parsed.data, mode };
        }
      }
    } catch {
      // Fallback to deterministic mock branch below.
    }
  }

  const base = templateForCategory(input.category ?? "generic");
  const businessType = normalizeBusinessType(input.category ?? "generic");
  const concept = businessType === "restaurant" ? inferRestaurantConcept(input) : null;
  const sections = normalizeSectionsForAgentWebsite(base.website.sections).map((section) => {
    if (!concept) return section;
    if (section.type === "menu") {
      return {
        ...section,
        title: concept.key === "seafood" ? "Today's fish highlights" : section.title,
        subtitle: concept.heroSubtitle,
        items: concept.menuItems,
      };
    }
    if (section.type === "booking") {
      return { ...section, cta: concept.primaryCTA, subtitle: "Reserve in under 30 seconds." };
    }
    return section;
  });

  return {
    mode,
    businessProfile: {
      ...base.businessProfile,
      businessName: input.businessName,
      category: input.category ?? "generic",
      city: input.city ?? "unknown",
      mainGoal: input.targetGoal,
      visualStyle: concept?.visualStyle ?? base.businessProfile.visualStyle,
      tone: concept?.tone ?? base.businessProfile.tone,
      colorPalette: concept?.palette ?? base.businessProfile.colorPalette,
      businessType,
    },
    website: {
      ...base.website,
      sections,
      hero: {
        ...base.website.hero,
        eyebrow: concept?.eyebrow ?? base.website.hero.eyebrow,
        title: concept?.heroTitle ?? `${input.businessName}: web orientada a conversión`,
        subtitle:
          concept?.heroSubtitle ??
          "Propuesta demo personalizada para captar más clientes desde móvil y desktop.",
        primaryCTA: concept?.primaryCTA ?? base.website.hero.primaryCTA,
        secondaryCTA: concept?.secondaryCTA ?? base.website.hero.secondaryCTA,
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
  if (mode === "live_agent") {
    try {
      const openai = getOpenAiClient();
      const completion = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are a senior CRO + brand UX strategist. Return only valid JSON and preserve schema consistency.",
          },
          {
            role: "user",
            content: `Regenerate website JSON.
Mode: ${input.mode}
Instruction: ${input.instruction}
Current:
${JSON.stringify(input.currentWebsiteJson)}

Rules:
- Return same schema (businessProfile, website, seo, contact, confidence).
- ${regenerateModeGuidance(input.mode)}
- Keep contact values unless there is explicit improvement instruction.
- Keep conversion-first quality.
- Avoid generic wording; produce specific, premium copy and visual direction.`,
          },
        ],
      });

      const raw = completion.choices[0]?.message?.content;
      if (raw) {
        const parsed = generateCustomWebsiteOutputSchema.safeParse(JSON.parse(raw));
        if (parsed.success) {
          return { ...parsed.data, mode };
        }
      }
    } catch {
      // Fall through to deterministic fallback.
    }
  }

  if (input.mode === "style") {
    const styleShift = input.instruction.toLowerCase();
    const nextPalette = styleShift.includes("premium")
      ? { primary: "#111827", secondary: "#7C3AED", background: "#F8FAFC", text: "#0F172A", accent: "#F59E0B" }
      : styleShift.includes("minimal")
        ? { primary: "#334155", secondary: "#94A3B8", background: "#F8FAFC", text: "#0F172A", accent: "#06B6D4" }
        : current.businessProfile.colorPalette;
    return {
      ...current,
      mode,
      businessProfile: {
        ...current.businessProfile,
        tone: `${current.businessProfile.tone} | ${input.instruction}`,
        colorPalette: nextPalette,
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
          subtitle: `${current.website.hero.subtitle} ${input.instruction}.`,
        },
        sections: current.website.sections.map((section) => ({
          ...section,
          subtitle:
            section.subtitle.length > 0
              ? `${section.subtitle} ${input.instruction}.`
              : input.instruction,
        })),
      },
      confidence: {
        ...current.confidence,
        salesAngle: `${current.confidence.salesAngle} ${input.instruction}.`,
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
          title: `${current.website.hero.title} | ${input.instruction}`,
        },
      },
    };
  }
  return {
    ...current,
    mode,
    website: {
      ...current.website,
      sections: current.website.sections.map((section, index) => ({
        ...section,
        order: index + 1,
      })),
    },
  };
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
