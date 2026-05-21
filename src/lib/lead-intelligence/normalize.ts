import type { BusinessIntelligenceProfile, GeneratedWebsiteOutput } from "@/src/lib/lead-intelligence/schemas";
import { cleanMarketingText } from "@/src/lib/website/clean-marketing-text";

const defaultSections = [
  "services",
  "reviews",
  "gallery",
  "contact",
  "process",
  "final_cta",
];

export function normalizeBusinessProfile(input: BusinessIntelligenceProfile): BusinessIntelligenceProfile {
  const sections =
    input.websiteStrategy.sectionsToGenerate.length >= 6
      ? input.websiteStrategy.sectionsToGenerate.slice(0, 10)
      : defaultSections;

  return {
    ...input,
    websiteStrategy: {
      ...input.websiteStrategy,
      sectionsToGenerate: sections.includes("final_cta")
        ? sections
        : [...sections.slice(0, 9), "final_cta"],
    },
    currentDigitalPresence: {
      ...input.currentDigitalPresence,
      websiteSummary: cleanMarketingText(
        input.currentDigitalPresence.websiteSummary,
        "Presencia digital mejorable con foco en confianza, claridad y conversión.",
        420,
      ),
    },
  };
}

export function normalizeGeneratedWebsite(
  website: GeneratedWebsiteOutput,
): GeneratedWebsiteOutput {
  const withSections =
    website.website.sections.length >= 6
      ? website.website.sections.slice(0, 10)
      : [
          ...website.website.sections,
          ...defaultSections.map((type, index) => ({
            type,
            variant: "default",
            title: `Sección ${index + 1}`,
            subtitle: "",
            items: [],
            cta: "Más información",
            order: website.website.sections.length + index + 1,
            imagePrompt: "business visual",
            imageAlt: "business visual",
          })),
        ].slice(0, 10);

  const hasFinalCta = withSections.some((item) => item.type === "final_cta");
  const finalSections = hasFinalCta
    ? withSections
    : [
        ...withSections.slice(0, 9),
        {
          type: "final_cta",
          variant: "banner",
          title: "¿Listo para mejorar tu web?",
          subtitle: "Te mostramos una propuesta personalizada.",
          items: [],
          cta: "Solicitar revisión",
          order: 10,
          imagePrompt: "final cta business visual",
          imageAlt: "final cta visual",
        },
      ];

  return {
    ...website,
    businessProfile: {
      ...website.businessProfile,
      businessName: cleanMarketingText(
        website.businessProfile.businessName,
        "Negocio local",
        80,
      ),
      category: cleanMarketingText(website.businessProfile.category, "servicios locales", 80),
      targetCustomer: cleanMarketingText(
        website.businessProfile.targetCustomer,
        "Clientes locales con intención de compra",
        160,
      ),
      tone: cleanMarketingText(website.businessProfile.tone, "Profesional y cercano", 120),
    },
    website: {
      ...website.website,
      hero: {
        ...website.website.hero,
        eyebrow: cleanMarketingText(website.website.hero.eyebrow, "Negocio local", 70),
        title: cleanMarketingText(
          website.website.hero.title,
          "Web profesional diseñada para convertir",
          90,
        ),
        subtitle: cleanMarketingText(
          website.website.hero.subtitle,
          "Propuesta digital orientada a captar más clientes cualificados.",
          180,
        ),
        primaryCTA: cleanMarketingText(website.website.hero.primaryCTA, "Solicitar información", 40),
        secondaryCTA: cleanMarketingText(website.website.hero.secondaryCTA, "Ver servicios", 40),
      },
      sections: finalSections
        .sort((a, b) => a.order - b.order)
        .slice(0, 10)
        .map((item, index) => ({
          ...item,
          title: cleanMarketingText(item.title, `Sección ${index + 1}`, 80),
          subtitle: cleanMarketingText(item.subtitle, "Contenido clave para convertir mejor.", 140),
          cta: cleanMarketingText(item.cta, "Más información", 40),
          imagePrompt: cleanMarketingText(item.imagePrompt, "professional business visual", 180),
          imageAlt: cleanMarketingText(item.imageAlt, "business visual", 80),
          order: index + 1,
        })),
    },
    confidence: {
      ...website.confidence,
      reasoning: cleanMarketingText(
        website.confidence.reasoning,
        "Generated with fallback-safe normalization.",
        220,
      ),
      salesAngle: cleanMarketingText(
        website.confidence.salesAngle,
        "Propuesta orientada a mejorar conversión local.",
        180,
      ),
    },
  };
}
