import OpenAI from "openai";
import { z } from "zod";
import { extractWebsiteIntelligence } from "@/src/lib/ai/website-intelligence";
import type { EnrichedPlace } from "@/src/lib/discovery/places";

const visualStyles = [
  "mediterranean",
  "premium_dark",
  "rustic",
  "modern_minimal",
  "clean_medical",
  "vintage",
  "urban",
  "luxury",
  "natural",
  "playful",
  "corporate",
  "industrial",
] as const;

export const businessIntelligenceProfileSchema = z.object({
  identity: z.object({
    businessName: z.string(),
    category: z.string(),
    businessType: z.string(),
    city: z.string(),
    address: z.string(),
    phone: z.string(),
    websiteUrl: z.string(),
    googleMapsUrl: z.string(),
  }),
  marketSignals: z.object({
    rating: z.number().nullable(),
    reviewCount: z.number().nullable(),
    reviewHighlights: z.array(z.string()),
    competitivePosition: z.string(),
    localOpportunity: z.string(),
  }),
  currentDigitalPresence: z.object({
    hasWebsite: z.boolean(),
    websiteSummary: z.string(),
    detectedProblems: z.array(z.string()),
    missingFeatures: z.array(z.string()),
    strengths: z.array(z.string()),
  }),
  visualIdentity: z.object({
    detectedStyle: z.string(),
    recommendedStyle: z.enum(visualStyles),
    colorPalette: z.object({
      primary: z.string(),
      secondary: z.string(),
      background: z.string(),
      text: z.string(),
      accent: z.string(),
    }),
    imageDirection: z.string(),
    heroImagePrompt: z.string(),
    galleryImagePrompts: z.array(z.string()),
  }),
  salesStrategy: z.object({
    mainGoal: z.string(),
    targetCustomer: z.string(),
    mainSalesAngle: z.string(),
    recommendedFeatures: z.array(z.string()),
    monthlyPlanSuggestion: z.object({
      name: z.string(),
      price: z.string(),
      features: z.array(z.string()),
    }),
  }),
  websiteStrategy: z.object({
    structureReasoning: z.string(),
    sectionsToGenerate: z.array(z.string()).min(6).max(10),
    tone: z.string(),
    ctaStrategy: z.string(),
  }),
});

export type BusinessIntelligenceProfile = z.infer<typeof businessIntelligenceProfileSchema>;

const profileInputSchema = z.object({
  lead: z.object({
    id: z.string(),
    businessName: z.string(),
    category: z.string(),
    city: z.string(),
    description: z.string().default(""),
    websiteUrl: z.string().default("unknown"),
    phone: z.string().default("unknown"),
    address: z.string().default("unknown"),
    googleMapsUrl: z.string().default("unknown"),
    detectedProblems: z.array(z.string()).default([]),
    recommendations: z.array(z.string()).default([]),
  }),
  enrichedPlace: z.custom<EnrichedPlace>().optional(),
  websiteCrawlSummary: z.string().default(""),
});

function hasOpenAiKey() {
  const key = process.env.OPENAI_API_KEY;
  return Boolean(key && key.startsWith("sk-") && key !== "tu_api_key");
}

function inferStyle(category: string) {
  const normalized = category.toLowerCase();
  if (normalized.includes("clinic") || normalized.includes("dental")) return "clean_medical";
  if (normalized.includes("barber")) return "vintage";
  if (normalized.includes("hotel")) return "premium_dark";
  if (normalized.includes("rest")) return "mediterranean";
  if (normalized.includes("inmobili")) return "corporate";
  if (normalized.includes("taller") || normalized.includes("motor")) return "industrial";
  return "modern_minimal";
}

function fallbackBusinessProfile(input: z.infer<typeof profileInputSchema>): BusinessIntelligenceProfile {
  const lead = input.lead;
  const enriched = input.enrichedPlace;
  const recommendedStyle = inferStyle(lead.category);
  const mainSections =
    lead.category.toLowerCase().includes("rest")
      ? ["menu", "gallery", "reviews", "booking", "location", "final_cta"]
      : ["services", "process", "reviews", "trust_badges", "contact", "final_cta"];

  return {
    identity: {
      businessName: enriched?.name ?? lead.businessName,
      category: enriched?.category ?? lead.category,
      businessType: lead.category,
      city: enriched?.city ?? lead.city,
      address: enriched?.address ?? lead.address,
      phone: enriched?.phone ?? lead.phone,
      websiteUrl: enriched?.websiteUrl ?? lead.websiteUrl,
      googleMapsUrl: enriched?.googleMapsUrl ?? lead.googleMapsUrl,
    },
    marketSignals: {
      rating: enriched?.rating ?? null,
      reviewCount: enriched?.reviewCount ?? null,
      reviewHighlights: enriched?.reviews?.slice(0, 3).map((item) => item.text) ?? [],
      competitivePosition: "Negocio local con margen de mejora en presencia digital y conversión.",
      localOpportunity: `Capturar más clientes cualificados en ${lead.city} con una web enfocada a conversión local.`,
    },
    currentDigitalPresence: {
      hasWebsite: Boolean((enriched?.websiteUrl ?? lead.websiteUrl) !== "unknown"),
      websiteSummary: input.websiteCrawlSummary || "Sin resumen de web actual.",
      detectedProblems: lead.detectedProblems,
      missingFeatures: ["CTA visible", "captación móvil", "prueba social", "SEO local"],
      strengths: ["Negocio real en Maps", "base de reseñas", "potencial de conversión local"],
    },
    visualIdentity: {
      detectedStyle: recommendedStyle,
      recommendedStyle,
      colorPalette: {
        primary: "#4f46e5",
        secondary: "#a78bfa",
        background: "#f8fafc",
        text: "#0f172a",
        accent: "#06b6d4",
      },
      imageDirection:
        "Fotografía realista del negocio con foco en producto/servicio y experiencia cliente.",
      heroImagePrompt: `Foto principal profesional de ${lead.businessName} en ${lead.city}, estilo ${recommendedStyle}, iluminación premium`,
      galleryImagePrompts: [
        `Interior de ${lead.businessName} con cliente satisfecho`,
        "Detalle de servicio principal en uso real",
        "Equipo profesional en contexto local",
      ],
    },
    salesStrategy: {
      mainGoal: "Mejorar presencia online y convertir más visitas en contactos/reservas.",
      targetCustomer: `Clientes locales de ${lead.city} buscando ${lead.category}.`,
      mainSalesAngle: "Web más profesional, rápida y creíble para aumentar conversión local.",
      recommendedFeatures: ["WhatsApp visible", "CTA sticky", "sección de reseñas", "bloque de confianza"],
      monthlyPlanSuggestion: {
        name: "Growth Local",
        price: "127 EUR/mes",
        features: ["Optimización continua", "Mantenimiento", "A/B de CTAs", "Mejora SEO local"],
      },
    },
    websiteStrategy: {
      structureReasoning:
        "Priorizar secciones que reducen fricción de decisión y llevan al contacto/reserva.",
      sectionsToGenerate: mainSections,
      tone: "Cercano, profesional y orientado a resultados.",
      ctaStrategy: "CTA principal arriba y CTA final de cierre con urgencia suave.",
    },
  };
}

export async function buildBusinessIntelligenceProfile(
  payload: z.infer<typeof profileInputSchema>,
) {
  const input = profileInputSchema.parse(payload);
  const fallback = fallbackBusinessProfile(input);
  const websiteIntel = await extractWebsiteIntelligence({
    websiteUrl: input.enrichedPlace?.websiteUrl ?? input.lead.websiteUrl,
    businessName: input.lead.businessName,
    category: input.lead.category,
    city: input.lead.city,
    fallbackText: `${input.lead.description}\n${input.websiteCrawlSummary}`,
  });

  if (!hasOpenAiKey()) {
    return businessIntelligenceProfileSchema.parse({
      ...fallback,
      visualIdentity: {
        ...fallback.visualIdentity,
        colorPalette: {
          primary: websiteIntel.brandColors[0] ?? fallback.visualIdentity.colorPalette.primary,
          secondary: websiteIntel.brandColors[1] ?? fallback.visualIdentity.colorPalette.secondary,
          background: fallback.visualIdentity.colorPalette.background,
          text: fallback.visualIdentity.colorPalette.text,
          accent: websiteIntel.brandColors[2] ?? fallback.visualIdentity.colorPalette.accent,
        },
      },
      currentDigitalPresence: {
        ...fallback.currentDigitalPresence,
        strengths: [
          ...fallback.currentDigitalPresence.strengths,
          ...websiteIntel.serviceHighlights.slice(0, 2),
        ],
      },
    });
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.35,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "Eres un estratega senior de prospección y CRO local. Devuelve SOLO JSON válido.",
        },
        {
          role: "user",
          content: `Construye un BusinessIntelligenceProfile completo.

Lead:
${JSON.stringify(input.lead)}

EnrichedPlace:
${JSON.stringify(input.enrichedPlace ?? null)}

WebsiteIntel:
${JSON.stringify(websiteIntel)}

Fallback base:
${JSON.stringify(fallback)}

Devuelve exactamente la estructura BusinessIntelligenceProfile.
Reglas:
- 6 a 10 secciones en websiteStrategy.sectionsToGenerate
- Pensar en conversion local, confianza y diferenciación visual.
- No inventes datos concretos (si falta, usa "unknown" o frases prudentes).
- recommendedStyle debe ser uno de: ${visualStyles.join(", ")}
- Responde solo JSON.`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) return fallback;
    const parsed = businessIntelligenceProfileSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return fallback;
    return parsed.data;
  } catch {
    return fallback;
  }
}
