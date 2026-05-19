import type { WebsiteGoal } from "@/src/lib/types/ai-website";

export const VISUAL_STYLE_PRESETS = [
  "warm_restaurant",
  "rustic_mediterranean",
  "premium_dark",
  "modern_minimal",
  "clean_medical",
  "vintage_barbershop",
  "luxury_real_estate",
  "playful_academy",
  "natural_wellness",
  "urban_fitness",
  "industrial_automotive",
  "boutique_hotel",
] as const;

export type VisualStylePreset = (typeof VISUAL_STYLE_PRESETS)[number];

type DesignStyleConfig = {
  layoutPersonality: string;
  colorDefaults: {
    primary: string;
    secondary: string;
    background: string;
    text: string;
    accent: string;
  };
  borderRadius: "rounded-xl" | "rounded-2xl" | "rounded-3xl";
  shadowIntensity: "shadow-sm" | "shadow-md" | "shadow-lg";
  heroVariantsAllowed: string[];
  sectionVariantsAllowed: Record<string, string[]>;
  ctaStyle: "solid" | "gradient" | "outline" | "elevated";
  typographyMood: string;
  backgroundTreatment: "clean" | "warm_gradient" | "dark_layers" | "editorial_soft";
};

export const websiteDesignSystem: Record<VisualStylePreset, DesignStyleConfig> = {
  warm_restaurant: {
    layoutPersonality: "Cercano, apetecible y orientado a reservas.",
    colorDefaults: {
      primary: "#b45309",
      secondary: "#f59e0b",
      background: "#fff7ed",
      text: "#292524",
      accent: "#16a34a",
    },
    borderRadius: "rounded-3xl",
    shadowIntensity: "shadow-md",
    heroVariantsAllowed: ["split_image", "local_business", "magazine_style"],
    sectionVariantsAllowed: {
      services: ["feature_grid", "horizontal_rows"],
      gallery: ["three_cards", "masonry"],
      reviews: ["testimonial_cards", "quote_wall"],
      contact: ["split_contact", "sticky_cta"],
      menu: ["highlighted_specials", "menu_cards"],
      booking: ["compact_form", "whatsapp_first"],
    },
    ctaStyle: "gradient",
    typographyMood: "Serif cálida con soporte sans moderno.",
    backgroundTreatment: "warm_gradient",
  },
  rustic_mediterranean: {
    layoutPersonality: "Artesanal, natural y con mucha textura visual.",
    colorDefaults: {
      primary: "#92400e",
      secondary: "#d97706",
      background: "#fffbeb",
      text: "#3f3f46",
      accent: "#0f766e",
    },
    borderRadius: "rounded-3xl",
    shadowIntensity: "shadow-sm",
    heroVariantsAllowed: ["split_image", "magazine_style", "local_business"],
    sectionVariantsAllowed: {
      services: ["editorial_list", "feature_grid"],
      gallery: ["masonry", "wide_banner"],
      reviews: ["quote_wall", "testimonial_cards"],
      contact: ["map_card", "split_contact"],
      menu: ["elegant_menu_list", "highlighted_specials"],
      booking: ["whatsapp_first", "compact_form"],
    },
    ctaStyle: "solid",
    typographyMood: "Serif editorial y microcopy humano.",
    backgroundTreatment: "warm_gradient",
  },
  premium_dark: {
    layoutPersonality: "Contraste alto, lujo y ritmo pausado.",
    colorDefaults: {
      primary: "#0f172a",
      secondary: "#334155",
      background: "#020617",
      text: "#e2e8f0",
      accent: "#c084fc",
    },
    borderRadius: "rounded-2xl",
    shadowIntensity: "shadow-lg",
    heroVariantsAllowed: ["dark_overlay", "centered_editorial", "card_hero"],
    sectionVariantsAllowed: {
      services: ["pricing_cards", "icon_cards"],
      gallery: ["wide_banner", "three_cards"],
      reviews: ["rating_summary", "testimonial_cards"],
      contact: ["sticky_cta", "split_contact"],
      menu: ["elegant_menu_list", "highlighted_specials"],
      booking: ["calendar_style_mock", "compact_form"],
    },
    ctaStyle: "elevated",
    typographyMood: "Elegante, premium y de alto ticket.",
    backgroundTreatment: "dark_layers",
  },
  modern_minimal: {
    layoutPersonality: "Limpio, ordenado y orientado a claridad.",
    colorDefaults: {
      primary: "#334155",
      secondary: "#94a3b8",
      background: "#f8fafc",
      text: "#0f172a",
      accent: "#0ea5e9",
    },
    borderRadius: "rounded-2xl",
    shadowIntensity: "shadow-sm",
    heroVariantsAllowed: ["minimal_clean", "centered_editorial", "card_hero"],
    sectionVariantsAllowed: {
      services: ["horizontal_rows", "feature_grid"],
      gallery: ["three_cards", "wide_banner"],
      reviews: ["testimonial_cards", "rating_summary"],
      contact: ["split_contact", "map_card"],
      menu: ["menu_cards", "elegant_menu_list"],
      booking: ["compact_form", "calendar_style_mock"],
    },
    ctaStyle: "outline",
    typographyMood: "Sans moderna, precisa y muy legible.",
    backgroundTreatment: "clean",
  },
  clean_medical: {
    layoutPersonality: "Confianza clínica, estructura y calma.",
    colorDefaults: {
      primary: "#2563eb",
      secondary: "#14b8a6",
      background: "#f8fafc",
      text: "#0f172a",
      accent: "#7c3aed",
    },
    borderRadius: "rounded-2xl",
    shadowIntensity: "shadow-sm",
    heroVariantsAllowed: ["minimal_clean", "local_business", "split_image"],
    sectionVariantsAllowed: {
      services: ["icon_cards", "horizontal_rows"],
      gallery: ["three_cards", "before_after_grid"],
      reviews: ["rating_summary", "testimonial_cards"],
      contact: ["map_card", "split_contact"],
      menu: ["menu_cards"],
      booking: ["calendar_style_mock", "compact_form"],
    },
    ctaStyle: "solid",
    typographyMood: "Profesional, tranquila y orientada a confianza.",
    backgroundTreatment: "clean",
  },
  vintage_barbershop: {
    layoutPersonality: "Clásico premium, masculino y con carácter.",
    colorDefaults: {
      primary: "#111827",
      secondary: "#b45309",
      background: "#0b0f19",
      text: "#f5f5f4",
      accent: "#dc2626",
    },
    borderRadius: "rounded-xl",
    shadowIntensity: "shadow-md",
    heroVariantsAllowed: ["dark_overlay", "magazine_style", "card_hero"],
    sectionVariantsAllowed: {
      services: ["pricing_cards", "editorial_list"],
      gallery: ["before_after_grid", "masonry"],
      reviews: ["quote_wall", "testimonial_cards"],
      contact: ["sticky_cta", "split_contact"],
      menu: ["highlighted_specials"],
      booking: ["whatsapp_first", "compact_form"],
    },
    ctaStyle: "elevated",
    typographyMood: "Vintage editorial con tono seguro.",
    backgroundTreatment: "dark_layers",
  },
  luxury_real_estate: {
    layoutPersonality: "Espaciado amplio, sobrio y aspiracional.",
    colorDefaults: {
      primary: "#0f4c81",
      secondary: "#cbd5e1",
      background: "#f8fafc",
      text: "#0f172a",
      accent: "#f59e0b",
    },
    borderRadius: "rounded-2xl",
    shadowIntensity: "shadow-md",
    heroVariantsAllowed: ["centered_editorial", "card_hero", "split_image"],
    sectionVariantsAllowed: {
      services: ["feature_grid", "editorial_list"],
      gallery: ["wide_banner", "masonry"],
      reviews: ["testimonial_cards", "quote_wall"],
      contact: ["map_card", "sticky_cta"],
      menu: ["elegant_menu_list"],
      booking: ["calendar_style_mock", "compact_form"],
    },
    ctaStyle: "outline",
    typographyMood: "Corporativa premium con microcopy de confianza.",
    backgroundTreatment: "editorial_soft",
  },
  playful_academy: {
    layoutPersonality: "Dinámica, amigable y didáctica.",
    colorDefaults: {
      primary: "#2563eb",
      secondary: "#f59e0b",
      background: "#f0f9ff",
      text: "#1e293b",
      accent: "#16a34a",
    },
    borderRadius: "rounded-3xl",
    shadowIntensity: "shadow-sm",
    heroVariantsAllowed: ["centered_editorial", "local_business", "minimal_clean"],
    sectionVariantsAllowed: {
      services: ["icon_cards", "feature_grid"],
      gallery: ["three_cards", "masonry"],
      reviews: ["quote_wall", "testimonial_cards"],
      contact: ["split_contact", "map_card"],
      menu: ["menu_cards"],
      booking: ["compact_form", "calendar_style_mock"],
    },
    ctaStyle: "gradient",
    typographyMood: "Cercana y motivadora.",
    backgroundTreatment: "editorial_soft",
  },
  natural_wellness: {
    layoutPersonality: "Orgánica, calmada y humana.",
    colorDefaults: {
      primary: "#166534",
      secondary: "#84cc16",
      background: "#f7fee7",
      text: "#14532d",
      accent: "#0ea5e9",
    },
    borderRadius: "rounded-3xl",
    shadowIntensity: "shadow-sm",
    heroVariantsAllowed: ["split_image", "minimal_clean", "local_business"],
    sectionVariantsAllowed: {
      services: ["horizontal_rows", "feature_grid"],
      gallery: ["masonry", "wide_banner"],
      reviews: ["testimonial_cards", "quote_wall"],
      contact: ["split_contact", "map_card"],
      menu: ["highlighted_specials", "menu_cards"],
      booking: ["compact_form", "whatsapp_first"],
    },
    ctaStyle: "solid",
    typographyMood: "Natural y reconfortante.",
    backgroundTreatment: "warm_gradient",
  },
  urban_fitness: {
    layoutPersonality: "Energética, directa y orientada a acción.",
    colorDefaults: {
      primary: "#4338ca",
      secondary: "#0ea5e9",
      background: "#f8fafc",
      text: "#0f172a",
      accent: "#f43f5e",
    },
    borderRadius: "rounded-xl",
    shadowIntensity: "shadow-md",
    heroVariantsAllowed: ["dark_overlay", "split_image", "local_business"],
    sectionVariantsAllowed: {
      services: ["pricing_cards", "feature_grid"],
      gallery: ["before_after_grid", "three_cards"],
      reviews: ["rating_summary", "testimonial_cards"],
      contact: ["sticky_cta", "split_contact"],
      menu: ["highlighted_specials"],
      booking: ["whatsapp_first", "compact_form"],
    },
    ctaStyle: "gradient",
    typographyMood: "Intensa y motivacional.",
    backgroundTreatment: "editorial_soft",
  },
  industrial_automotive: {
    layoutPersonality: "Funcional, robusta y de confianza técnica.",
    colorDefaults: {
      primary: "#1e293b",
      secondary: "#64748b",
      background: "#f8fafc",
      text: "#0f172a",
      accent: "#f97316",
    },
    borderRadius: "rounded-xl",
    shadowIntensity: "shadow-sm",
    heroVariantsAllowed: ["card_hero", "local_business", "dark_overlay"],
    sectionVariantsAllowed: {
      services: ["horizontal_rows", "pricing_cards"],
      gallery: ["before_after_grid", "wide_banner"],
      reviews: ["rating_summary", "testimonial_cards"],
      contact: ["map_card", "sticky_cta"],
      menu: ["menu_cards"],
      booking: ["whatsapp_first", "calendar_style_mock"],
    },
    ctaStyle: "solid",
    typographyMood: "Técnica y clara.",
    backgroundTreatment: "clean",
  },
  boutique_hotel: {
    layoutPersonality: "Elegante, experiencial y visualmente aspiracional.",
    colorDefaults: {
      primary: "#334155",
      secondary: "#a78bfa",
      background: "#f8fafc",
      text: "#0f172a",
      accent: "#d97706",
    },
    borderRadius: "rounded-2xl",
    shadowIntensity: "shadow-md",
    heroVariantsAllowed: ["magazine_style", "centered_editorial", "split_image"],
    sectionVariantsAllowed: {
      services: ["editorial_list", "feature_grid"],
      gallery: ["wide_banner", "masonry"],
      reviews: ["quote_wall", "testimonial_cards"],
      contact: ["map_card", "split_contact"],
      menu: ["elegant_menu_list", "highlighted_specials"],
      booking: ["calendar_style_mock", "compact_form"],
    },
    ctaStyle: "elevated",
    typographyMood: "Editorial premium.",
    backgroundTreatment: "editorial_soft",
  },
};

const heroFallback = ["split_image", "centered_editorial", "local_business"];

function mapLegacyVisualStyle(input: string): VisualStylePreset {
  const style = input.toLowerCase();
  if (style === "warm_restaurant" || style === "mediterranean") return "warm_restaurant";
  if (style === "rustic_mediterranean") return "rustic_mediterranean";
  if (style === "premium_dark") return "premium_dark";
  if (style === "modern_minimal") return "modern_minimal";
  if (style === "clean_medical") return "clean_medical";
  if (style === "vintage" || style === "vintage_barbershop") return "vintage_barbershop";
  if (style === "luxury_real_estate" || style === "corporate") return "luxury_real_estate";
  if (style === "playful_academy" || style === "playful") return "playful_academy";
  if (style === "natural_wellness" || style === "natural") return "natural_wellness";
  if (style === "urban_fitness" || style === "urban") return "urban_fitness";
  if (style === "industrial_automotive" || style === "industrial") return "industrial_automotive";
  if (style === "boutique_hotel" || style === "luxury") return "boutique_hotel";
  return "modern_minimal";
}

function simpleHash(seed: string) {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

function pickDeterministic(options: string[], seed: string) {
  if (options.length === 0) return "default";
  const index = simpleHash(seed) % options.length;
  return options[index];
}

function objectiveFlavor(goal: WebsiteGoal) {
  switch (goal) {
    case "get_reservations":
      return "reservations";
    case "get_appointments":
      return "appointments";
    case "capture_leads":
      return "lead_capture";
    case "sell_products":
      return "commerce";
    case "get_whatsapp_messages":
      return "whatsapp";
    default:
      return "trust";
  }
}

export type ResolvedWebsiteDesign = {
  style: VisualStylePreset;
  config: DesignStyleConfig;
  heroVariant: string;
  sectionVariantByIndex: Record<number, string>;
  ctaStyle: DesignStyleConfig["ctaStyle"];
  radiusClass: DesignStyleConfig["borderRadius"];
  shadowClass: DesignStyleConfig["shadowIntensity"];
  backgroundTreatment: DesignStyleConfig["backgroundTreatment"];
  typographyMood: string;
};

type DesignInput = {
  businessProfile: {
    visualStyle: string;
    businessType: string;
    businessName: string;
    mainGoal: WebsiteGoal;
  };
  website: {
    hero: { variant: string };
    sections: Array<{ type: string; variant: string }>;
  };
};

export function resolveWebsiteDesign(data: DesignInput): ResolvedWebsiteDesign {
  const style = mapLegacyVisualStyle(data.businessProfile.visualStyle);
  const config = websiteDesignSystem[style];
  const businessSeed = `${data.businessProfile.businessType}-${data.businessProfile.businessName}-${objectiveFlavor(data.businessProfile.mainGoal)}`;

  const requestedHero = data.website.hero.variant?.toLowerCase().trim();
  const heroVariant =
    requestedHero && config.heroVariantsAllowed.includes(requestedHero)
      ? requestedHero
      : pickDeterministic(
          config.heroVariantsAllowed.length > 0 ? config.heroVariantsAllowed : heroFallback,
          businessSeed,
        );

  const sectionVariantByIndex: Record<number, string> = {};
  data.website.sections.forEach((section, index) => {
    const requested = section.variant?.toLowerCase().trim();
    const allowed = config.sectionVariantsAllowed[section.type] ?? [];
    sectionVariantByIndex[index] =
      requested && allowed.includes(requested)
        ? requested
        : pickDeterministic(
            allowed.length > 0 ? allowed : [requested || "default"],
            `${businessSeed}-${section.type}-${index}`,
          );
  });

  return {
    style,
    config,
    heroVariant,
    sectionVariantByIndex,
    ctaStyle: config.ctaStyle,
    radiusClass: config.borderRadius,
    shadowClass: config.shadowIntensity,
    backgroundTreatment: config.backgroundTreatment,
    typographyMood: config.typographyMood,
  };
}
