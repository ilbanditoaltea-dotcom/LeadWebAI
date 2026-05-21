export const WEBSITE_STYLES = [
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
  "generic_local",
] as const;

export type WebsiteStyle = (typeof WEBSITE_STYLES)[number];

export const styleByCategory: Array<{ match: RegExp; style: WebsiteStyle }> = [
  { match: /(restaurant|restaurante|italian|steak|sushi|burger|tapas)/i, style: "warm_restaurant" },
  { match: /(rustic|mediterranean|mediterraneo)/i, style: "rustic_mediterranean" },
  { match: /(clinic|dental|medic|salud)/i, style: "clean_medical" },
  { match: /(barber|barberia|peluquer)/i, style: "vintage_barbershop" },
  { match: /(real.?estate|inmobili)/i, style: "luxury_real_estate" },
  { match: /(academy|school|english|academia)/i, style: "playful_academy" },
  { match: /(wellness|spa|natural|vegan)/i, style: "natural_wellness" },
  { match: /(fitness|gym|crossfit)/i, style: "urban_fitness" },
  { match: /(automotive|motor|taller|car)/i, style: "industrial_automotive" },
  { match: /(hotel|boutique)/i, style: "boutique_hotel" },
];

export function inferWebsiteStyle(input: string): WebsiteStyle {
  for (const item of styleByCategory) {
    if (item.match.test(input)) return item.style;
  }
  return "generic_local";
}
