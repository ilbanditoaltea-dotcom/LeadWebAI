import type { BusinessIntelligenceProfile, GeneratedWebsiteOutput } from "@/src/lib/lead-intelligence/schemas";

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
      websiteSummary: input.currentDigitalPresence.websiteSummary || "Sin resumen de web disponible.",
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
    website: {
      ...website.website,
      sections: finalSections
        .sort((a, b) => a.order - b.order)
        .slice(0, 10)
        .map((item, index) => ({ ...item, order: index + 1 })),
    },
    confidence: {
      ...website.confidence,
      reasoning: website.confidence.reasoning || "Generated with fallback-safe normalization.",
    },
  };
}
