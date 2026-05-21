import {
  BUSINESS_TYPES,
  VISUAL_STYLES,
  WEBSITE_GOALS,
  type BusinessType,
  type VisualStyle,
  type WebsiteGoal,
} from "@/src/lib/types/ai-website";
import {
  generateCustomWebsiteOutputSchema,
  type GenerateCustomWebsiteOutput,
} from "@/src/lib/ai/generate-custom-website";

function asString(value: unknown, fallback: string) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function asNullableString(value: unknown) {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function pickBusinessType(value: unknown): BusinessType {
  const normalized = asString(value, "generic").toLowerCase();
  const direct = BUSINESS_TYPES.find((item) => item === normalized);
  if (direct) return direct;
  if (normalized.includes("restaur") || normalized.includes("bar")) return "restaurant";
  if (normalized.includes("clinic") || normalized.includes("dental") || normalized.includes("medical")) {
    return "clinic";
  }
  if (normalized.includes("barber")) return "barbershop";
  if (normalized.includes("beauty") || normalized.includes("pelu")) return "beauty";
  if (normalized.includes("hotel")) return "hotel";
  if (normalized.includes("fitness") || normalized.includes("gym")) return "fitness";
  if (normalized.includes("shop") || normalized.includes("tienda")) return "shop";
  if (normalized.includes("academy") || normalized.includes("academ")) return "academy";
  if (normalized.includes("inmob") || normalized.includes("real_estate")) return "real_estate";
  if (normalized.includes("taller") || normalized.includes("automotive")) return "automotive";
  return "generic";
}

function pickWebsiteGoal(value: unknown): WebsiteGoal {
  const normalized = asString(value, "capture_leads").toLowerCase();
  const direct = WEBSITE_GOALS.find((item) => item === normalized);
  if (direct) return direct;
  if (normalized.includes("reserv")) return "get_reservations";
  if (normalized.includes("cita") || normalized.includes("appointment")) return "get_appointments";
  if (normalized.includes("llam") || normalized.includes("call")) return "get_calls";
  if (normalized.includes("whatsapp")) return "get_whatsapp_messages";
  if (normalized.includes("venta") || normalized.includes("sell") || normalized.includes("product")) {
    return "sell_products";
  }
  if (normalized.includes("catalog")) return "show_catalog";
  if (normalized.includes("trust") || normalized.includes("confian")) return "build_trust";
  if (normalized.includes("servic")) return "promote_services";
  return "capture_leads";
}

function pickVisualStyle(value: unknown): VisualStyle {
  const normalized = asString(value, "generic_local").toLowerCase();
  const direct = VISUAL_STYLES.find((item) => item === normalized);
  if (direct) return direct;
  if (normalized.includes("premium") || normalized.includes("dark")) return "premium_dark";
  if (normalized.includes("rustic") || normalized.includes("mediterr")) return "rustic_mediterranean";
  if (normalized.includes("warm") || normalized.includes("restaurant")) return "warm_restaurant";
  if (normalized.includes("medical") || normalized.includes("clinic")) return "clean_medical";
  if (normalized.includes("barber") || normalized.includes("vintage")) return "vintage_barbershop";
  if (normalized.includes("luxury") || normalized.includes("real_estate")) return "luxury_real_estate";
  if (normalized.includes("playful") || normalized.includes("academy")) return "playful_academy";
  if (normalized.includes("natural") || normalized.includes("wellness")) return "natural_wellness";
  if (normalized.includes("urban") || normalized.includes("fitness")) return "urban_fitness";
  if (normalized.includes("industrial") || normalized.includes("automotive")) return "industrial_automotive";
  if (normalized.includes("hotel") || normalized.includes("boutique")) return "boutique_hotel";
  if (normalized.includes("minimal") || normalized.includes("modern")) return "modern_minimal";
  return "generic_local";
}

function normalizeSectionType(value: unknown) {
  const type = asString(value, "services");
  if (type === "feat_cta") return "final_cta";
  return type;
}

function coerceSections(rawSections: unknown) {
  const incoming = Array.isArray(rawSections) ? rawSections : [];
  const normalized = incoming.map((raw, index) => {
    const source = (raw ?? {}) as Record<string, unknown>;
    return {
      type: normalizeSectionType(source.type),
      variant: asString(source.variant, "default"),
      title: asString(source.title, `Sección ${index + 1}`),
      subtitle: asString(source.subtitle, ""),
      imagePrompt: asString(source.imagePrompt, "professional business visual"),
      imageAlt: asString(source.imageAlt, "business visual"),
      items: Array.isArray(source.items) ? source.items : [],
      cta: asString(source.cta, "Más información"),
      order:
        typeof source.order === "number" && Number.isFinite(source.order) ? source.order : index + 1,
    };
  });

  const withMinimum =
    normalized.length >= 6
      ? normalized
      : [
          ...normalized,
          ...["services", "reviews", "gallery", "contact", "process", "final_cta"]
            .filter((type) => !normalized.some((section) => section.type === type))
            .map((type, index) => ({
              type,
              variant: "default",
              title: type.replaceAll("_", " "),
              subtitle: "",
              imagePrompt: "professional business visual",
              imageAlt: "business visual",
              items: [],
              cta: "Más información",
              order: normalized.length + index + 1,
            })),
        ].slice(0, 10);

  const hasFinalCta = withMinimum.some((section) => section.type === "final_cta");
  const ensured = hasFinalCta
    ? withMinimum
    : [
        ...withMinimum.slice(0, 9),
        {
          type: "final_cta",
          variant: "banner",
          title: "¿Listo para mejorar tu web?",
          subtitle: "Te mostramos una propuesta personalizada.",
          imagePrompt: "final cta business visual",
          imageAlt: "final cta visual",
          items: [],
          cta: "Solicitar revisión",
          order: withMinimum.length + 1,
        },
      ];

  return ensured
    .sort((a, b) => a.order - b.order)
    .slice(0, 10)
    .map((section, index) => ({ ...section, order: index + 1 }));
}

export function coerceGeneratedWebsiteOutput(raw: unknown): GenerateCustomWebsiteOutput {
  const source = (raw ?? {}) as Record<string, unknown>;
  const businessProfile = (source.businessProfile ?? {}) as Record<string, unknown>;
  const website = (source.website ?? {}) as Record<string, unknown>;
  const hero = (website.hero ?? {}) as Record<string, unknown>;
  const seo = (source.seo ?? {}) as Record<string, unknown>;
  const contact = (source.contact ?? {}) as Record<string, unknown>;
  const confidence = (source.confidence ?? {}) as Record<string, unknown>;
  const palette = (businessProfile.colorPalette ?? {}) as Record<string, unknown>;

  const candidate = {
    businessProfile: {
      businessName: asString(businessProfile.businessName, "Negocio local"),
      businessType: pickBusinessType(businessProfile.businessType ?? businessProfile.category),
      city: asString(businessProfile.city, "Ciudad"),
      category: asString(businessProfile.category, "servicios locales"),
      targetCustomer: asString(
        businessProfile.targetCustomer,
        "Clientes locales con intención de compra",
      ),
      mainGoal: pickWebsiteGoal(businessProfile.mainGoal),
      tone: asString(businessProfile.tone, "Profesional y cercano"),
      visualStyle: pickVisualStyle(businessProfile.visualStyle),
      colorPalette: {
        primary: asString(palette.primary, "#7c3aed"),
        secondary: asString(palette.secondary, "#a78bfa"),
        background: asString(palette.background, "#ffffff"),
        text: asString(palette.text, "#0f172a"),
        accent: asString(palette.accent, "#f59e0b"),
      },
      fontStyle: asString(businessProfile.fontStyle, "Modern sans"),
      imageStyle: asString(businessProfile.imageStyle, "Local business photography"),
    },
    website: {
      hero: {
        variant: asString(hero.variant, "local_business"),
        eyebrow: asString(hero.eyebrow, "Negocio local"),
        title: asString(hero.title, "Web profesional diseñada para convertir"),
        subtitle: asString(
          hero.subtitle,
          "Propuesta digital orientada a captar más clientes cualificados.",
        ),
        primaryCTA: asString(hero.primaryCTA, "Solicitar información"),
        secondaryCTA: asString(hero.secondaryCTA, "Ver servicios"),
        backgroundImagePrompt: asString(
          hero.backgroundImagePrompt,
          "professional local business hero image",
        ),
      },
      sections: coerceSections(website.sections),
    },
    seo: {
      title: asString(seo.title, "Negocio local"),
      description: asString(seo.description, "Web profesional orientada a conversión local."),
      keywords: Array.isArray(seo.keywords)
        ? seo.keywords.map((item) => String(item)).filter(Boolean).slice(0, 12)
        : [],
    },
    contact: {
      phone: asString(asNullableString(contact.phone), "unknown"),
      email: asString(asNullableString(contact.email), "unknown"),
      whatsapp: asString(asNullableString(contact.whatsapp), "unknown"),
      address: asString(asNullableString(contact.address), "unknown"),
    },
    confidence: {
      reasoning: asString(confidence.reasoning, "Generated with fallback-safe normalization."),
      salesAngle: asString(
        confidence.salesAngle,
        "Propuesta orientada a mejorar conversión local.",
      ),
      detectedProblems: Array.isArray(confidence.detectedProblems)
        ? confidence.detectedProblems.map((item) => String(item))
        : [],
      recommendedFeatures: Array.isArray(confidence.recommendedFeatures)
        ? confidence.recommendedFeatures.map((item) => String(item))
        : [],
    },
  };

  const parsed = generateCustomWebsiteOutputSchema.safeParse(candidate);
  if (parsed.success) return parsed.data;
  return generateCustomWebsiteOutputSchema.parse(candidate);
}
