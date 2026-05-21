import {
  generatedWebsiteMocksById,
  type GeneratedWebsite,
  type JsonValue,
  type WebsiteColorPalette,
} from "@/src/lib/types/ai-website";
import { cleanMarketingText } from "@/src/lib/website/clean-marketing-text";

export type NormalizedWebsiteSection = {
  type: string;
  variant: string;
  title: string;
  subtitle: string;
  imagePrompt?: string;
  imageAlt?: string;
  items: JsonValue[];
  cta: string;
  order: number;
};

export type NormalizedGeneratedWebsite = Omit<GeneratedWebsite, "website"> & {
  website: {
    hero: GeneratedWebsite["website"]["hero"];
    sections: NormalizedWebsiteSection[];
    seo: GeneratedWebsite["website"]["seo"];
    contact: GeneratedWebsite["website"]["contact"];
    confidence: GeneratedWebsite["website"]["confidence"];
  };
};

function asString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim().length > 0 ? value : fallback;
}

function asItems(value: unknown): JsonValue[] {
  return Array.isArray(value) ? (value as JsonValue[]) : [];
}

function normalizePalette(input: unknown, fallback: WebsiteColorPalette): WebsiteColorPalette {
  const source = (input ?? {}) as Record<string, unknown>;
  return {
    primary: asString(source.primary, fallback.primary),
    secondary: asString(source.secondary, fallback.secondary),
    background: asString(source.background, fallback.background),
    text: asString(source.text, fallback.text),
    accent: asString(source.accent, fallback.accent),
  };
}

function normalizeSections(
  rawSections: unknown,
  fallbackSections: NormalizedWebsiteSection[],
): NormalizedWebsiteSection[] {
  const incoming = Array.isArray(rawSections) ? rawSections : [];
  const normalized = incoming.map((raw, index) => {
    const source = (raw ?? {}) as Record<string, unknown>;
    return {
      type: asString(source.type, "generic"),
      variant: asString(source.variant, "default"),
      title: cleanMarketingText(asString(source.title, ""), `Sección ${index + 1}`, 80),
      subtitle: cleanMarketingText(
        asString(source.subtitle, ""),
        "Contenido clave para convertir mejor.",
        140,
      ),
      imagePrompt:
        typeof source.imagePrompt === "string" ? source.imagePrompt : undefined,
      imageAlt: typeof source.imageAlt === "string" ? source.imageAlt : undefined,
      items: asItems(source.items),
      cta: cleanMarketingText(asString(source.cta, ""), "Más información", 40),
      order:
        typeof source.order === "number" && Number.isFinite(source.order)
          ? source.order
          : index + 1,
    };
  });

  const withFallback = normalized.length > 0 ? normalized : fallbackSections;
  const hasFinalCta = withFallback.some((section) => section.type === "final_cta");
  const ensuredFinalCta = hasFinalCta
    ? withFallback
    : [
        ...withFallback,
        {
          type: "final_cta",
          variant: "banner",
          title: "¿Hablamos de tu nueva web?",
          subtitle: "Te mostramos la propuesta completa en una llamada breve.",
          items: [],
          cta: "Solicitar revisión",
          order: withFallback.length + 1,
        },
      ];

  const sorted = [...ensuredFinalCta]
    .sort((a, b) => a.order - b.order)
    .slice(0, 10);

  while (sorted.length < 6) {
    const fallback = fallbackSections[sorted.length % fallbackSections.length];
    sorted.push({
      ...fallback,
      order: sorted.length + 1,
      title: `${fallback.title}`,
    });
  }

  return sorted.map((section, index) => ({ ...section, order: index + 1 }));
}

export function normalizeGeneratedWebsite(data: GeneratedWebsite): NormalizedGeneratedWebsite {
  const fallback = generatedWebsiteMocksById["restaurant-demo"];
  const fallbackSections = fallback.website.sections
    .filter((section) => section.type !== "hero")
    .map((section) => ({
      type: section.type,
      variant: section.variant,
      title: section.title,
      subtitle: section.subtitle,
      imagePrompt: section.imagePrompt,
      imageAlt: section.imageAlt,
      items: section.items,
      cta: section.cta,
      order: section.order,
    }));

  return {
    ...data,
    businessProfile: {
      ...data.businessProfile,
      businessName: cleanMarketingText(
        asString(data.businessProfile.businessName, fallback.businessProfile.businessName),
        fallback.businessProfile.businessName,
        80,
      ),
      category: cleanMarketingText(
        asString(data.businessProfile.category, fallback.businessProfile.category),
        fallback.businessProfile.category,
        80,
      ),
      city: asString(data.businessProfile.city, fallback.businessProfile.city),
      targetCustomer: cleanMarketingText(
        asString(data.businessProfile.targetCustomer, fallback.businessProfile.targetCustomer),
        fallback.businessProfile.targetCustomer,
        160,
      ),
      tone: cleanMarketingText(
        asString(data.businessProfile.tone, fallback.businessProfile.tone),
        fallback.businessProfile.tone,
        120,
      ),
      fontStyle: asString(data.businessProfile.fontStyle, fallback.businessProfile.fontStyle),
      imageStyle: asString(data.businessProfile.imageStyle, fallback.businessProfile.imageStyle),
      colorPalette: normalizePalette(
        data.businessProfile.colorPalette,
        fallback.businessProfile.colorPalette,
      ),
    },
    website: {
      hero: {
        ...data.website.hero,
        variant: asString(data.website.hero.variant, fallback.website.hero.variant),
        eyebrow: cleanMarketingText(
          asString(data.website.hero.eyebrow, fallback.website.hero.eyebrow),
          fallback.website.hero.eyebrow,
          70,
        ),
        title: cleanMarketingText(
          asString(data.website.hero.title, fallback.website.hero.title),
          fallback.website.hero.title,
          90,
        ),
        subtitle: cleanMarketingText(
          asString(data.website.hero.subtitle, fallback.website.hero.subtitle),
          "Propuesta digital orientada a captar más clientes cualificados.",
          180,
        ),
        primaryCTA: cleanMarketingText(asString(data.website.hero.primaryCTA, ""), "Solicitar propuesta", 40),
        secondaryCTA: cleanMarketingText(asString(data.website.hero.secondaryCTA, ""), "Ver servicios", 40),
        backgroundImagePrompt: asString(
          data.website.hero.backgroundImagePrompt,
          fallback.website.hero.backgroundImagePrompt,
        ),
      },
      sections: normalizeSections(data.website.sections, fallbackSections),
      seo: {
        title: cleanMarketingText(
          asString(data.website.seo.title, fallback.website.seo.title),
          fallback.website.seo.title,
          90,
        ),
        description: cleanMarketingText(
          asString(data.website.seo.description, fallback.website.seo.description),
          fallback.website.seo.description,
          180,
        ),
        keywords: Array.isArray(data.website.seo.keywords)
          ? data.website.seo.keywords.map((item) => String(item))
          : fallback.website.seo.keywords,
      },
      contact: {
        phone: asString(data.website.contact.phone, "unknown"),
        email: asString(data.website.contact.email, "unknown"),
        whatsapp: asString(data.website.contact.whatsapp, "unknown"),
        address: asString(data.website.contact.address, "unknown"),
      },
      confidence: {
        reasoning: cleanMarketingText(
          asString(data.website.confidence.reasoning, fallback.website.confidence.reasoning),
          fallback.website.confidence.reasoning,
          220,
        ),
        salesAngle: cleanMarketingText(
          asString(data.website.confidence.salesAngle, fallback.website.confidence.salesAngle),
          fallback.website.confidence.salesAngle,
          180,
        ),
        detectedProblems: Array.isArray(data.website.confidence.detectedProblems)
          ? data.website.confidence.detectedProblems.map((item) => String(item))
          : fallback.website.confidence.detectedProblems,
        recommendedFeatures: Array.isArray(data.website.confidence.recommendedFeatures)
          ? data.website.confidence.recommendedFeatures.map((item) => String(item))
          : fallback.website.confidence.recommendedFeatures,
      },
    },
  };
}
