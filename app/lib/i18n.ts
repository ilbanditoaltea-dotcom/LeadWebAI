export type Locale = "es" | "en";

const DEFAULT_LOCALE: Locale = "es";

export function normalizeLocale(value: string | null | undefined): Locale {
  if (value === "en") return "en";
  return DEFAULT_LOCALE;
}

export function getLocaleFromCookieString(cookieString: string | undefined): Locale {
  if (!cookieString) return DEFAULT_LOCALE;
  const matched = cookieString.match(/(?:^|;\s*)locale=(es|en)(?:;|$)/);
  return normalizeLocale(matched?.[1]);
}

export function getClientLocale(): Locale {
  if (typeof document === "undefined") {
    return DEFAULT_LOCALE;
  }
  return getLocaleFromCookieString(document.cookie);
}

type Texts = {
  appSubtitle: string;
  searchLead: string;
  dateRange: string;
  proPlan: string;
  proPlanBody: string;
  seeBenefits: string;
  language: string;
  dashboardWelcome: string;
  dashboardSummary: string;
  last30Days: string;
};

const textsByLocale: Record<Locale, Texts> = {
  es: {
    appSubtitle: "Centro operativo de prospeccion y conversion comercial.",
    searchLead: "Buscar lead",
    dateRange: "20 Mayo - 27 Mayo",
    proPlan: "Plan Pro",
    proPlanBody: "Aprovecha al maximo LeadWeb AI con mas demos y automatizaciones.",
    seeBenefits: "Ver beneficios",
    language: "Idioma",
    dashboardWelcome: "Bienvenido de nuevo, Alejandro",
    dashboardSummary: "Aqui tienes un resumen de tu agente de prospeccion.",
    last30Days: "Ultimos 30 dias",
  },
  en: {
    appSubtitle: "Operations center for prospecting and sales conversion.",
    searchLead: "Search lead",
    dateRange: "May 20 - May 27",
    proPlan: "Pro Plan",
    proPlanBody: "Get the most out of LeadWeb AI with more demos and automations.",
    seeBenefits: "View benefits",
    language: "Language",
    dashboardWelcome: "Welcome back, Alejandro",
    dashboardSummary: "Here is a summary of your prospecting agent.",
    last30Days: "Last 30 days",
  },
};

const sidebarLabels: Record<string, Record<Locale, string>> = {
  "/dashboard": { es: "Dashboard", en: "Dashboard" },
  "/leads": { es: "Leads", en: "Leads" },
  "/analysis": { es: "Análisis Web", en: "Web Analysis" },
  "/ai-generator": { es: "Generar Demo", en: "Generate Demo" },
  "/demos": { es: "Demos", en: "Demos" },
  "/messages": { es: "Mensajes", en: "Messages" },
  "/campaigns": { es: "Campañas", en: "Campaigns" },
  "/follow-up": { es: "Seguimiento", en: "Follow-up" },
  "/clients": { es: "Clientes", en: "Clients" },
  "/settings": { es: "Ajustes", en: "Settings" },
};

const statLabels: Record<string, Record<Locale, string>> = {
  "Leads encontrados": { es: "Leads encontrados", en: "Leads found" },
  "Demos generadas": { es: "Demos generadas", en: "Demos generated" },
  "Mensajes preparados": { es: "Mensajes preparados", en: "Messages prepared" },
  Respuestas: { es: "Respuestas", en: "Responses" },
  "Clientes cerrados": { es: "Clientes cerrados", en: "Closed clients" },
};

export function t(locale: Locale, key: keyof Texts): string {
  return textsByLocale[locale][key];
}

export function sidebarLabel(locale: Locale, href: string, fallback: string): string {
  return sidebarLabels[href]?.[locale] ?? fallback;
}

export function statLabel(locale: Locale, fallback: string): string {
  return statLabels[fallback]?.[locale] ?? fallback;
}
