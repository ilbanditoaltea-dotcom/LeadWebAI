import OpenAI from "openai";
import { z } from "zod";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import type { Database, Json } from "@/src/lib/supabase/database.types";
import {
  generateCustomWebsiteOutputSchema,
  type GenerateCustomWebsiteOutput,
} from "@/src/lib/ai/generate-custom-website";
import {
  applyChannelLengthRules,
  generateSalesMessageOutputSchema,
  type GenerateSalesMessageOutput,
} from "@/src/lib/ai/generate-sales-message";
import {
  BUSINESS_TYPES,
  WEBSITE_GOALS,
  VISUAL_STYLES,
  type BusinessType,
  type WebsiteGoal,
  type VisualStyle,
} from "@/src/lib/types/ai-website";
import {
  analyzeBusinessOutputSchema,
  type AnalyzeBusinessOutput,
} from "@/src/lib/ai/analyze-business";
import {
  extractWebsiteIntelligence,
  type WebsiteIntelligence,
} from "@/src/lib/ai/website-intelligence";

const discoveredBusinessSchema = z.object({
  businessName: z.string().min(2),
  city: z.string().min(1),
  category: z.string().min(1),
  address: z.string().default("unknown"),
  phone: z.string().default("unknown"),
  websiteUrl: z.string().default("unknown"),
  rating: z.number().nullable().default(null),
  reviewCount: z.number().nullable().default(null),
  googleMapsUrl: z.string().default("unknown"),
  mapsCategory: z.string().default("unknown"),
  mapsSnippet: z.string().default(""),
});

export const runCampaignInputSchema = z.object({
  city: z.string().min(2),
  category: z.string().min(2),
  limit: z.number().int().min(1).max(20).default(8),
  channel: z.enum(["email", "whatsapp", "instagram_dm", "call_script"]).default("email"),
});

export type RunCampaignInput = z.infer<typeof runCampaignInputSchema>;

type DiscoveredBusiness = z.infer<typeof discoveredBusinessSchema>;
type LeadInsert = Database["public"]["Tables"]["leads"]["Insert"];

const openAiApiKey = process.env.OPENAI_API_KEY;
const serperApiKey = process.env.SERPER_API_KEY;
const firecrawlApiKey = process.env.FIRECRAWL_API_KEY;
const scrapingBeeApiKey = process.env.SCRAPINGBEE_API_KEY;

const CAMPAIGN_SAFE_BUDGET_MS = 50_000;
const DISCOVERY_TIMEOUT_MS = 8_000;
const CRAWL_TIMEOUT_MS = 7_000;
const OPENAI_ANALYSIS_TIMEOUT_MS = 12_000;
const OPENAI_WEBSITE_TIMEOUT_MS = 14_000;
const OPENAI_MESSAGE_TIMEOUT_MS = 10_000;

function hasUsableOpenAiKey() {
  return Boolean(
    openAiApiKey &&
      openAiApiKey.startsWith("sk-") &&
      openAiApiKey !== "tu_api_key" &&
      !openAiApiKey.includes("REPLACE"),
  );
}

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number, timeoutMessage: string): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  const timeoutPromise = new Promise<T>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(timeoutMessage));
    }, timeoutMs);
  });

  try {
    return await Promise.race([promise, timeoutPromise]);
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

async function fetchWithTimeout(
  input: RequestInfo | URL,
  init: RequestInit,
  timeoutMs: number,
): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeoutId);
  }
}

function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function normalizeBusinessType(category: string): BusinessType {
  const lower = category.toLowerCase();
  if (lower.includes("rest")) return "restaurant";
  if (lower.includes("barber")) return "barbershop";
  if (lower.includes("clinic") || lower.includes("dental")) return "clinic";
  if (lower.includes("beauty") || lower.includes("pelu")) return "beauty";
  if (lower.includes("inmobili") || lower.includes("estate")) return "real_estate";
  if (lower.includes("academy") || lower.includes("english") || lower.includes("escuela"))
    return "academy";
  if (lower.includes("hotel")) return "hotel";
  if (lower.includes("taller") || lower.includes("auto") || lower.includes("motor"))
    return "automotive";
  if (lower.includes("shop") || lower.includes("tienda")) return "shop";
  return "generic";
}

function goalByBusinessType(type: BusinessType): WebsiteGoal {
  if (type === "restaurant" || type === "hotel") return "get_reservations";
  if (type === "clinic" || type === "beauty" || type === "barbershop") return "get_appointments";
  if (type === "real_estate" || type === "academy") return "capture_leads";
  if (type === "shop") return "sell_products";
  if (type === "automotive") return "get_calls";
  return "promote_services";
}

function visualStyleByType(type: BusinessType): VisualStyle {
  if (type === "restaurant") return "mediterranean";
  if (type === "clinic") return "clean_medical";
  if (type === "barbershop") return "vintage";
  if (type === "beauty") return "luxury";
  if (type === "real_estate") return "corporate";
  if (type === "academy") return "playful";
  if (type === "automotive") return "industrial";
  if (type === "hotel") return "premium_dark";
  if (type === "shop") return "natural";
  return "modern_minimal";
}

function normalizeCandidateUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed || trimmed === "unknown") return "unknown";
  const withProtocol = /^https?:\/\//i.test(trimmed) ? trimmed : `https://${trimmed}`;
  try {
    const url = new URL(withProtocol);
    const host = url.hostname.toLowerCase();
    if (!host || host.includes("google.") || host.includes("facebook.com") || host.includes("instagram.com")) {
      return "unknown";
    }
    return `${url.protocol}//${url.host}${url.pathname}`.replace(/\/$/, "");
  } catch {
    return "unknown";
  }
}

function looksSyntheticBusinessName(name: string, category: string) {
  const normalizedName = slugify(name);
  const normalizedCategory = slugify(category);
  if (!normalizedName) return true;
  if (/-(central|prime|plus|studio|elite|nova|urban|costa|blue|top)-\d+$/.test(normalizedName)) {
    return true;
  }
  if (normalizedName === normalizedCategory || normalizedName.startsWith(`${normalizedCategory}-`)) {
    return /\d+$/.test(normalizedName);
  }
  return false;
}

function isVerifiableBusinessCandidate(business: DiscoveredBusiness) {
  const hasAddress = business.address !== "unknown" && business.address.trim().length >= 4;
  const hasWebsite = business.websiteUrl !== "unknown";
  const hasPhone = business.phone !== "unknown";
  const hasMaps = business.googleMapsUrl !== "unknown";
  const hasTrustSignals = Boolean(
    (typeof business.rating === "number" && business.rating > 0) ||
      (typeof business.reviewCount === "number" && business.reviewCount > 0),
  );
  if (looksSyntheticBusinessName(business.businessName, business.category)) {
    return false;
  }
  if (!hasMaps) {
    return false;
  }
  // Keep quality guardrails while allowing more real-world small businesses:
  // a candidate is valid if it has maps + (website OR phone OR trust),
  // and either a usable address or enough trust/phone data.
  const hasCoreSignal = hasWebsite || hasPhone || hasTrustSignals;
  const hasContextSignal = hasAddress || hasPhone || hasTrustSignals;
  return hasCoreSignal && hasContextSignal;
}

function buildGoogleMapsUrl(params: { cid?: string; title?: string; address?: string; city?: string }) {
  if (params.cid) {
    return `https://www.google.com/maps?cid=${params.cid}`;
  }
  const query = [params.title, params.address, params.city]
    .filter((item) => typeof item === "string" && item.trim().length > 0)
    .join(" ");
  if (!query) return "unknown";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

function candidateQualityScore(business: DiscoveredBusiness) {
  let score = 0;
  if (business.googleMapsUrl !== "unknown") score += 40;
  if (business.phone !== "unknown") score += 20;
  if (business.websiteUrl !== "unknown") score += 20;
  if (business.address !== "unknown") score += 10;
  if (typeof business.reviewCount === "number" && business.reviewCount > 0) score += 10;
  return score;
}

function buildGoogleMapsResearchSummary(business: DiscoveredBusiness) {
  const facts: string[] = [];
  facts.push(`Business: ${business.businessName}`);
  facts.push(`Category: ${business.category}`);
  facts.push(`City: ${business.city}`);
  facts.push(`Address: ${business.address}`);
  facts.push(`Phone: ${business.phone}`);
  facts.push(`Website: ${business.websiteUrl}`);
  facts.push(`Google Maps URL: ${business.googleMapsUrl}`);
  if (business.mapsCategory && business.mapsCategory !== "unknown") {
    facts.push(`Google Maps category: ${business.mapsCategory}`);
  }
  if (typeof business.rating === "number") {
    facts.push(`Rating: ${business.rating.toFixed(1)}/5`);
  }
  if (typeof business.reviewCount === "number") {
    facts.push(`Reviews: ${business.reviewCount}`);
  }
  if (business.mapsSnippet.trim().length > 0) {
    facts.push(`Maps snippet: ${business.mapsSnippet.trim()}`);
  }

  if (business.websiteUrl === "unknown") {
    facts.push(
      "No website detected. Focus proposal on Google Maps conversion, click-to-call, WhatsApp/contact, and simple booking capture.",
    );
  }

  return facts.join("\n");
}

async function discoverBusinesses(input: RunCampaignInput): Promise<DiscoveredBusiness[]> {
  if (!serperApiKey) {
    return [];
  }

  try {
    const response = await fetchWithTimeout(
      "https://google.serper.dev/places",
      {
        method: "POST",
        headers: {
          "X-API-KEY": serperApiKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          q: `${input.category} in ${input.city}`,
          gl: "es",
          hl: "es",
          num: input.limit,
        }),
      },
      DISCOVERY_TIMEOUT_MS,
    );

    if (!response.ok) {
      return [];
    }

    const json = (await response.json()) as {
      places?: Array<{
        title?: string;
        address?: string;
        phoneNumber?: string;
        website?: string;
        rating?: number;
        ratingCount?: number;
        cid?: string;
        type?: string;
        category?: string;
        description?: string;
      }>;
    };

    const places = (json.places ?? [])
      .slice(0, input.limit)
      .map((place) =>
        discoveredBusinessSchema.safeParse({
          businessName: place.title ?? "unknown business",
          city: input.city,
          category: input.category,
          address: place.address ?? "unknown",
          phone: place.phoneNumber ?? "unknown",
          websiteUrl: normalizeCandidateUrl(place.website ?? "unknown"),
          rating: typeof place.rating === "number" ? place.rating : null,
          reviewCount: typeof place.ratingCount === "number" ? place.ratingCount : null,
          googleMapsUrl: buildGoogleMapsUrl({
            cid: place.cid,
            title: place.title,
            address: place.address,
            city: input.city,
          }),
          mapsCategory: place.type ?? place.category ?? "unknown",
          mapsSnippet: place.description ?? "",
        }),
      )
      .filter((item) => item.success)
      .map((item) => item.data)
      .filter((item) => isVerifiableBusinessCandidate(item));

    const deduped = Array.from(
      new Map(
        places.map((item) => [
          `${slugify(item.businessName)}|${slugify(item.address)}|${slugify(item.phone)}`,
          item,
        ]),
      ).values(),
    );
    const ranked = deduped
      .sort((a, b) => candidateQualityScore(b) - candidateQualityScore(a))
      .slice(0, input.limit);

    if (ranked.length === 0) {
      return [];
    }

    return ranked;
  } catch {
    return [];
  }
}

async function crawlWebsite(url: string) {
  if (!url || url === "unknown") {
    return { summary: "No website detected.", pagesScanned: 0, rawContent: "" };
  }

  const normalizeContent = (value: string) =>
    value.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();

  const buildResult = (content: string) => ({
    summary: content.slice(0, 3000),
    pagesScanned: 1,
    rawContent: content.slice(0, 12000),
  });

  if (firecrawlApiKey) {
    try {
      const response = await fetchWithTimeout(
        "https://api.firecrawl.dev/v1/scrape",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${firecrawlApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            url,
            formats: ["markdown"],
            onlyMainContent: true,
          }),
        },
        CRAWL_TIMEOUT_MS,
      );
      const json = (await response.json()) as {
        data?: { markdown?: string };
      };
      const markdown = (json.data?.markdown ?? "").trim();
      if (markdown.length > 60) {
        return buildResult(markdown);
      }
    } catch {
      // fallback continues below
    }
  }

  if (scrapingBeeApiKey) {
    try {
      const endpoint = `https://app.scrapingbee.com/api/v1/?api_key=${scrapingBeeApiKey}&url=${encodeURIComponent(url)}&render_js=false`;
      const response = await fetchWithTimeout(endpoint, {}, CRAWL_TIMEOUT_MS);
      const html = await response.text();
      const plain = normalizeContent(html);
      if (plain.length > 60) {
        return buildResult(plain);
      }
    } catch {
      // fallback continues below
    }
  }

  try {
    const response = await fetchWithTimeout(
      url,
      {
        headers: { "User-Agent": "LeadWebAI-Agent/1.0 (+https://leadweb-ai.vercel.app)" },
      },
      CRAWL_TIMEOUT_MS,
    );
    const html = await response.text();
    const plain = normalizeContent(html);
    if (plain.length > 60) {
      return buildResult(plain);
    }
    return {
      summary: "Website reachable but low-readable content (likely JS-rendered or blocked).",
      pagesScanned: 1,
      rawContent: html.slice(0, 12000),
    };
  } catch {
    return { summary: "Website crawl failed.", pagesScanned: 0, rawContent: "" };
  }
}

function fallbackAnalysis(business: DiscoveredBusiness, crawlSummary: string): AnalyzeBusinessOutput {
  const type = normalizeBusinessType(business.category);
  const goal = goalByBusinessType(type);
  return {
    businessType: type,
    opportunityScore: 70,
    websiteQualityScore: crawlSummary.includes("No website") ? 35 : 55,
    targetCustomer: `Local customers in ${business.city}`,
    mainGoal: goal,
    detectedProblems: [
      "Website copy is not conversion-oriented.",
      "Primary CTA is not clearly visible.",
      "Mobile user flow needs simplification.",
    ],
    recommendations: [
      "Add clear CTA in hero and sticky contact action.",
      "Improve social proof with testimonials and trust badges.",
      "Optimize service sections for mobile scanning.",
    ],
    salesAngle:
      "We prepared a conversion-first visual demo with stronger CTA hierarchy.",
    suggestedMonthlyPlan: {
      name: "Growth Local",
      price: "127 EUR/month",
      reason: "Continuous optimization for conversion and local visibility.",
      features: [
        "Monthly conversion tweaks",
        "Local SEO updates",
        "WhatsApp and booking optimization",
      ],
    },
  };
}

async function analyzeBusinessWithAI(
  business: DiscoveredBusiness,
  leadId: string,
  crawlSummary: string,
): Promise<AnalyzeBusinessOutput> {
  if (!hasUsableOpenAiKey()) {
    return fallbackAnalysis(business, crawlSummary);
  }

  try {
    const openai = new OpenAI({ apiKey: openAiApiKey });
    const completion = await withTimeout(
      openai.chat.completions.create({
        model: "gpt-4.1-mini",
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are a senior local-business marketing auditor. Return only valid JSON.",
          },
          {
            role: "user",
            content: `Analyze business and return JSON.
leadId: ${leadId}
businessName: ${business.businessName}
category: ${business.category}
city: ${business.city}
websiteUrl: ${business.websiteUrl}
crawlSummary: ${crawlSummary}

Return schema:
{
  "businessType": "${BUSINESS_TYPES.join(" | ")}",
  "opportunityScore": 0,
  "websiteQualityScore": 0,
  "targetCustomer": "",
  "mainGoal": "${WEBSITE_GOALS.join(" | ")}",
  "detectedProblems": [],
  "recommendations": [],
  "salesAngle": "",
  "suggestedMonthlyPlan": {
    "name": "",
    "price": "",
    "reason": "",
    "features": []
  }
}`,
          },
        ],
      }),
      OPENAI_ANALYSIS_TIMEOUT_MS,
      "OpenAI analysis timeout",
    );

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return fallbackAnalysis(business, crawlSummary);
    }

    const parsed = analyzeBusinessOutputSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      return fallbackAnalysis(business, crawlSummary);
    }

    return parsed.data;
  } catch {
    return fallbackAnalysis(business, crawlSummary);
  }
}

function fallbackWebsiteBlueprint(
  business: DiscoveredBusiness,
  analysis: AnalyzeBusinessOutput,
  websiteIntel: WebsiteIntelligence,
): GenerateCustomWebsiteOutput {
  const visualStyle = visualStyleByType(analysis.businessType);
  const paletteByStyle: Record<VisualStyle, { primary: string; secondary: string; background: string; text: string; accent: string }> = {
    premium_dark: { primary: "#1D4ED8", secondary: "#38BDF8", background: "#0B1020", text: "#E2E8F0", accent: "#F59E0B" },
    clean_medical: { primary: "#2563EB", secondary: "#14B8A6", background: "#F8FAFC", text: "#0F172A", accent: "#8B5CF6" },
    warm_restaurant: { primary: "#B45309", secondary: "#FB7185", background: "#FFF7ED", text: "#292524", accent: "#84CC16" },
    modern_minimal: { primary: "#475569", secondary: "#A78BFA", background: "#F8FAFC", text: "#0F172A", accent: "#06B6D4" },
    luxury: { primary: "#BE185D", secondary: "#F9A8D4", background: "#FFF1F2", text: "#3F3F46", accent: "#7C3AED" },
    playful: { primary: "#2563EB", secondary: "#F59E0B", background: "#F0F9FF", text: "#1E293B", accent: "#10B981" },
    industrial: { primary: "#1E293B", secondary: "#F97316", background: "#F8FAFC", text: "#0F172A", accent: "#0EA5E9" },
    natural: { primary: "#166534", secondary: "#4ADE80", background: "#F7FEE7", text: "#14532D", accent: "#EAB308" },
    corporate: { primary: "#0F4C81", secondary: "#38BDF8", background: "#F8FAFC", text: "#0F172A", accent: "#F97316" },
    mediterranean: { primary: "#B91C1C", secondary: "#F59E0B", background: "#FFF7ED", text: "#1F2937", accent: "#15803D" },
    vintage: { primary: "#111827", secondary: "#D97706", background: "#0B0F19", text: "#F8FAFC", accent: "#B91C1C" },
    urban: { primary: "#4338CA", secondary: "#22D3EE", background: "#F8FAFC", text: "#0F172A", accent: "#F43F5E" },
  };
  const intelPalette =
    websiteIntel.brandColors.length >= 2
      ? {
          ...paletteByStyle[visualStyle],
          primary: websiteIntel.brandColors[0],
          secondary: websiteIntel.brandColors[1],
          accent: websiteIntel.brandColors[2] ?? paletteByStyle[visualStyle].accent,
        }
      : paletteByStyle[visualStyle];

  return {
    businessProfile: {
      businessName: business.businessName,
      businessType: analysis.businessType,
      city: business.city,
      category: business.category,
      targetCustomer: analysis.targetCustomer,
      mainGoal: analysis.mainGoal,
      tone: "Professional and persuasive",
      visualStyle,
      colorPalette: intelPalette,
      fontStyle: "Modern sans-serif",
      imageStyle: "Professional commercial photography",
    },
    website: {
      hero: {
        variant: "conversion-hero",
        eyebrow: `${business.category} in ${business.city}`,
        title: `${business.businessName}: stronger digital presence, more qualified opportunities`,
        subtitle:
          "A modern, conversion-oriented website adapted to local customer intent.",
        primaryCTA: "Request consultation",
        secondaryCTA: "View services",
        backgroundImagePrompt: `Professional hero image for ${business.category} business in ${business.city}`,
      },
      sections: [
        {
          type: "services",
          variant: "grid",
          title: "Core services",
          subtitle: "Clear offerings designed for quick decision-making.",
          imagePrompt: "Professional service showcase",
          imageAlt: "Services preview",
          items:
            websiteIntel.serviceHighlights.length > 0
              ? websiteIntel.serviceHighlights.slice(0, 3).map((name) => ({ name }))
              : websiteIntel.menuHighlights.length > 0
                ? websiteIntel.menuHighlights.slice(0, 3).map((name) => ({ name }))
                : [{ name: "Service 1" }, { name: "Service 2" }, { name: "Service 3" }],
          cta: "See all services",
          order: 1,
        },
        {
          type: "process",
          variant: "steps",
          title: "How we work",
          subtitle: "A simple process to reduce friction and increase trust.",
          imagePrompt: "Business process visual",
          imageAlt: "Process section",
          items: [{ step: "Discovery" }, { step: "Proposal" }, { step: "Execution" }],
          cta: "Start now",
          order: 2,
        },
        {
          type: "reviews",
          variant: "cards",
          title: "Client feedback",
          subtitle: "Social proof that supports conversion.",
          imagePrompt: "Happy customers testimonials visual",
          imageAlt: "Reviews section",
          items: [{ author: "Local customer", text: "Great experience and fast response." }],
          cta: "Read more",
          order: 3,
        },
        {
          type: "pricing",
          variant: "compact",
          title: "Plans",
          subtitle: "Transparent options aligned with your goals.",
          imagePrompt: "Pricing comparison cards",
          imageAlt: "Pricing section",
          items: [{ plan: analysis.suggestedMonthlyPlan.name, price: analysis.suggestedMonthlyPlan.price }],
          cta: "Compare plans",
          order: 4,
        },
        {
          type: "contact",
          variant: "split",
          title: "Contact",
          subtitle: "Talk to us and receive a tailored proposal.",
          imagePrompt: "Contact section with call and message options",
          imageAlt: "Contact section",
          items: [{ channel: "phone" }, { channel: "whatsapp" }],
          cta: "Contact now",
          order: 5,
        },
        {
          type: "final_cta",
          variant: "banner",
          title: "Ready to improve your digital conversion?",
          subtitle: "Review your custom visual demo and approve next steps.",
          imagePrompt: "Final CTA professional banner",
          imageAlt: "Final CTA",
          items: [],
          cta: "Request your demo review",
          order: 6,
        },
      ],
    },
    seo: {
      title: `${business.businessName} | Professional website proposal`,
      description: `Conversion-oriented website proposal for ${business.businessName} in ${business.city}.`,
      keywords: [business.businessName.toLowerCase(), business.category.toLowerCase(), business.city.toLowerCase()],
    },
    contact: {
      phone: business.phone || "unknown",
      email: "unknown",
      whatsapp: business.phone || "unknown",
      address: business.address || "unknown",
    },
    confidence: {
      reasoning: analysis.suggestedMonthlyPlan.reason,
      salesAngle: analysis.salesAngle,
      detectedProblems: analysis.detectedProblems,
      recommendedFeatures: analysis.recommendations,
    },
  };
}

async function generateWebsiteWithAI(
  business: DiscoveredBusiness,
  analysis: AnalyzeBusinessOutput,
  websiteIntel: WebsiteIntelligence,
): Promise<GenerateCustomWebsiteOutput> {
  if (!hasUsableOpenAiKey()) {
    return fallbackWebsiteBlueprint(business, analysis, websiteIntel);
  }

  try {
    const openai = new OpenAI({ apiKey: openAiApiKey });
    const completion = await withTimeout(
      openai.chat.completions.create({
        model: "gpt-4.1-mini",
        temperature: 0.45,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are a senior CRO web strategist. Return only valid JSON and preserve schema.",
          },
          {
            role: "user",
            content: `Generate website JSON for:
businessName: ${business.businessName}
city: ${business.city}
category: ${business.category}
businessType: ${analysis.businessType}
mainGoal: ${analysis.mainGoal}
detectedProblems: ${JSON.stringify(analysis.detectedProblems)}
recommendations: ${JSON.stringify(analysis.recommendations)}
salesAngle: ${analysis.salesAngle}
websiteIntelligence: ${JSON.stringify(websiteIntel)}

Return schema exactly:
{
  "businessProfile": {
    "businessName": "",
    "businessType": "${BUSINESS_TYPES.join(" | ")}",
    "city": "",
    "category": "",
    "targetCustomer": "",
    "mainGoal": "${WEBSITE_GOALS.join(" | ")}",
    "tone": "",
    "visualStyle": "${VISUAL_STYLES.join(" | ")}",
    "colorPalette": {"primary":"","secondary":"","background":"","text":"","accent":""},
    "fontStyle": "",
    "imageStyle": ""
  },
  "website": {
    "hero": {
      "variant": "",
      "eyebrow": "",
      "title": "",
      "subtitle": "",
      "primaryCTA": "",
      "secondaryCTA": "",
      "backgroundImagePrompt": ""
    },
    "sections": []
  },
  "seo": {"title":"","description":"","keywords":[]},
  "contact": {"phone":"","email":"","whatsapp":"","address":""},
  "confidence": {"reasoning":"","salesAngle":"","detectedProblems":[],"recommendedFeatures":[]}
}

Rules:
- 6 to 10 sections.
- Must include final_cta.
- Use conversion-oriented copy.
- Reuse discovered colors/services/menu/CTA clues from websiteIntelligence when available.
- Keep contact realistic, never fabricate unknown as real data.`,
          },
        ],
      }),
      OPENAI_WEBSITE_TIMEOUT_MS,
      "OpenAI website timeout",
    );

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return fallbackWebsiteBlueprint(business, analysis, websiteIntel);
    }
    const parsed = generateCustomWebsiteOutputSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      return fallbackWebsiteBlueprint(business, analysis, websiteIntel);
    }
    return parsed.data;
  } catch {
    return fallbackWebsiteBlueprint(business, analysis, websiteIntel);
  }
}

function fallbackSalesMessage(
  business: DiscoveredBusiness,
  analysis: AnalyzeBusinessOutput,
  channel: RunCampaignInput["channel"],
  demoUrl: string,
): GenerateSalesMessageOutput {
  const body =
    `Hola equipo de ${business.businessName}, hemos detectado ${analysis.detectedProblems.slice(0, 2).join(" y ")}. ` +
    `Ya preparamos una demo visual adaptada a vuestro negocio para mejorar conversion y captacion local: ${demoUrl}. ` +
    "Si os encaja, podemos revisarla en una llamada breve esta semana.";

  return applyChannelLengthRules({
    channel,
    subject: `Demo visual para ${business.businessName}`,
    body,
    personalizationPoints: [business.city, business.category],
    mainSalesAngle: analysis.salesAngle,
    cta: "¿Te va bien revisarla esta semana?",
    riskNotes: ["No se prometen resultados garantizados."],
  });
}

async function generateSalesMessageWithAI(
  business: DiscoveredBusiness,
  analysis: AnalyzeBusinessOutput,
  channel: RunCampaignInput["channel"],
  demoUrl: string,
): Promise<GenerateSalesMessageOutput> {
  if (!hasUsableOpenAiKey()) {
    return fallbackSalesMessage(business, analysis, channel, demoUrl);
  }

  try {
    const openai = new OpenAI({ apiKey: openAiApiKey });
    const completion = await withTimeout(
      openai.chat.completions.create({
        model: "gpt-4.1-mini",
        temperature: 0.35,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content:
              "You are a senior B2B local-sales copywriter. Return only valid JSON.",
          },
          {
            role: "user",
            content: `Create suggested sales message.
channel: ${channel}
businessName: ${business.businessName}
city: ${business.city}
category: ${business.category}
detectedProblems: ${JSON.stringify(analysis.detectedProblems.slice(0, 2))}
demoUrl: ${demoUrl}

Return:
{
  "channel": "${channel}",
  "subject": "",
  "body": "",
  "personalizationPoints": [],
  "mainSalesAngle": "",
  "cta": "",
  "riskNotes": []
}
Rules:
- Natural, concise, not spammy.
- Mention visual demo and 1-2 detected problems.
- Soft CTA.
- whatsapp <=700, instagram_dm <=500.`,
          },
        ],
      }),
      OPENAI_MESSAGE_TIMEOUT_MS,
      "OpenAI message timeout",
    );

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return fallbackSalesMessage(business, analysis, channel, demoUrl);
    }
    const parsed = generateSalesMessageOutputSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) {
      return fallbackSalesMessage(business, analysis, channel, demoUrl);
    }
    return applyChannelLengthRules(parsed.data);
  } catch {
    return fallbackSalesMessage(business, analysis, channel, demoUrl);
  }
}

async function buildUniqueDemoSlug(baseName: string) {
  const supabase = await createSupabaseServerClient();
  const baseSlug = slugify(baseName) || "demo";
  const { data } = await supabase
    .from("generated_websites")
    .select("demo_slug")
    .ilike("demo_slug", `${baseSlug}%`);
  if (!data || data.length === 0) return baseSlug;
  return `${baseSlug}-${Date.now().toString(36).slice(-4)}`;
}

function safeJson(value: unknown): Json {
  return value as Json;
}

export async function runAutopilotCampaign(input: RunCampaignInput) {
  const parsedInput = runCampaignInputSchema.parse(input);
  const supabase = await createSupabaseServerClient();
  const discoveredAll = await discoverBusinesses(parsedInput);
  if (discoveredAll.length === 0) {
    return {
      campaign: {
        id: null,
        name: `Autopilot ${parsedInput.category} ${parsedInput.city}`,
        city: parsedInput.city,
        category: parsedInput.category,
      },
      discoveredCount: 0,
      processedCount: 0,
      pendingApprovalCount: 0,
      failedCount: 0,
      mode: hasUsableOpenAiKey() ? "live_ai" : "fallback_no_openai_key",
      truncatedByTimeBudget: false,
      truncatedBySafeLimit: false,
      requestedLimit: parsedInput.limit,
      effectiveLimit: 0,
      results: [],
      warning:
        "No se encontraron negocios verificables. Revisa SERPER_API_KEY o prueba otra ciudad/categoria.",
    };
  }
  const maxLeadsPerRun = hasUsableOpenAiKey() ? 1 : 5;
  const discovered = discoveredAll.slice(0, Math.min(parsedInput.limit, maxLeadsPerRun));
  const startedAt = Date.now();
  let truncatedByTimeBudget = false;
  const truncatedBySafeLimit = discoveredAll.length > discovered.length;

  const campaignName = `Autopilot ${parsedInput.category} ${parsedInput.city}`;
  const { data: campaign } = await supabase
    .from("campaigns")
    .insert({
      name: campaignName,
      city: parsedInput.city,
      category: parsedInput.category,
      status: "active",
    })
    .select("*")
    .maybeSingle();

  const results: Array<{
    businessName: string;
    leadId: string | null;
    generatedWebsiteId: string | null;
    messageId: string | null;
    status: "pending_approval" | "error";
    error?: string;
  }> = [];

  for (const business of discovered) {
    if (Date.now() - startedAt > CAMPAIGN_SAFE_BUDGET_MS) {
      truncatedByTimeBudget = true;
      results.push({
        businessName: business.businessName,
        leadId: null,
        generatedWebsiteId: null,
        messageId: null,
        status: "error",
        error: "Skipped to avoid server timeout. Retry with lower limit.",
      });
      continue;
    }

    try {
      const leadInsert: LeadInsert = {
        business_name: business.businessName,
        category: business.category,
        city: business.city,
        description: `Auto-discovered lead for ${business.category} in ${business.city}`,
        address: business.address,
        phone: business.phone,
        website_url: business.websiteUrl,
        google_maps_url: business.googleMapsUrl,
        rating: business.rating,
        review_count: business.reviewCount,
        status: "new",
      };

      const { data: lead, error: leadError } = await supabase
        .from("leads")
        .insert(leadInsert)
        .select("*")
        .maybeSingle();

      if (leadError || !lead) {
        results.push({
          businessName: business.businessName,
          leadId: null,
          generatedWebsiteId: null,
          messageId: null,
          status: "error",
          error: leadError?.message ?? "Lead insert failed",
        });
        continue;
      }

      await supabase.from("activities").insert({
        lead_id: lead.id,
        type: "autopilot_discovered",
        description: `Lead discovered in campaign ${campaignName}`,
        metadata: safeJson({ campaignId: campaign?.id ?? null }),
      });

      const crawl = await crawlWebsite(business.websiteUrl);
      const mapsResearch = buildGoogleMapsResearchSummary(business);
      const researchSummary = `${mapsResearch}\n\n[Website crawl]\n${crawl.summary}`;
      const researchRawContent = `${mapsResearch}\n\n${crawl.rawContent}`;
      const websiteIntel = await extractWebsiteIntelligence({
        websiteUrl: business.websiteUrl,
        businessName: business.businessName,
        category: business.category,
        city: business.city,
        fallbackText: `${researchSummary}\n${researchRawContent}`,
      });
      const analysis = await analyzeBusinessWithAI(business, lead.id, researchSummary);

      await supabase
        .from("leads")
        .update({
          status: "analyzed",
          opportunity_score: analysis.opportunityScore,
          website_quality_score: analysis.websiteQualityScore,
          detected_problems: safeJson(analysis.detectedProblems),
          recommendations: safeJson(analysis.recommendations),
          main_problem_detected: analysis.detectedProblems[0] ?? "unknown",
          description: `${lead.description ?? ""}\n\n[Google Maps]\n${mapsResearch.slice(0, 700)}\n\n[Autopilot crawl]\n${crawl.summary.slice(0, 500)}`,
        })
        .eq("id", lead.id);

      const website = await generateWebsiteWithAI(business, analysis, websiteIntel);
      const demoSlug = await buildUniqueDemoSlug(business.businessName);
      const { data: generatedWebsite, error: generatedError } = await supabase
        .from("generated_websites")
        .insert({
          lead_id: lead.id,
          business_profile: safeJson(website.businessProfile),
          website: safeJson(website.website),
          seo: safeJson(website.seo),
          contact: safeJson(website.contact),
          confidence: safeJson(website.confidence),
          demo_slug: demoSlug,
          status: "draft",
        })
        .select("*")
        .maybeSingle();

      if (generatedError || !generatedWebsite) {
        results.push({
          businessName: business.businessName,
          leadId: lead.id,
          generatedWebsiteId: null,
          messageId: null,
          status: "error",
          error: generatedError?.message ?? "Website generation insert failed",
        });
        continue;
      }

      const demoUrl = `/demo/${demoSlug}`;
      const message = await generateSalesMessageWithAI(
        business,
        analysis,
        parsedInput.channel,
        demoUrl,
      );

      const { data: savedMessage, error: messageError } = await supabase
        .from("messages")
        .insert({
          lead_id: lead.id,
          generated_website_id: generatedWebsite.id,
          channel: message.channel,
          subject: message.subject,
          body: message.body,
          status: "draft",
        })
        .select("*")
        .maybeSingle();

      if (messageError || !savedMessage) {
        results.push({
          businessName: business.businessName,
          leadId: lead.id,
          generatedWebsiteId: generatedWebsite.id,
          messageId: null,
          status: "error",
          error: messageError?.message ?? "Message insert failed",
        });
        continue;
      }

      await supabase
        .from("leads")
        .update({ status: "pending_approval" })
        .eq("id", lead.id);

      await supabase.from("activities").insert([
        {
          lead_id: lead.id,
          type: "autopilot_website_generated",
          description: "Generated website proposal created automatically.",
          metadata: safeJson({ generatedWebsiteId: generatedWebsite.id, demoSlug }),
        },
        {
          lead_id: lead.id,
          type: "autopilot_message_generated",
          description: "Suggested sales message generated automatically.",
          metadata: safeJson({ messageId: savedMessage.id, channel: message.channel }),
        },
        {
          lead_id: lead.id,
          type: "autopilot_pending_approval",
          description: "Lead moved to pending_approval for manual confirmation.",
          metadata: safeJson({ campaignId: campaign?.id ?? null }),
        },
      ]);

      results.push({
        businessName: business.businessName,
        leadId: lead.id,
        generatedWebsiteId: generatedWebsite.id,
        messageId: savedMessage.id,
        status: "pending_approval",
      });
    } catch (error) {
      results.push({
        businessName: business.businessName,
        leadId: null,
        generatedWebsiteId: null,
        messageId: null,
        status: "error",
        error: error instanceof Error ? error.message : "Unknown autopilot error",
      });
    }
  }

  const ok = results.filter((item) => item.status === "pending_approval").length;
  const failed = results.length - ok;

  return {
    campaign: {
      id: campaign?.id ?? null,
      name: campaignName,
      city: parsedInput.city,
      category: parsedInput.category,
    },
    discoveredCount: discovered.length,
    processedCount: results.length,
    pendingApprovalCount: ok,
    failedCount: failed,
    mode: hasUsableOpenAiKey() ? "live_ai" : "fallback_no_openai_key",
    truncatedByTimeBudget,
    truncatedBySafeLimit,
    requestedLimit: parsedInput.limit,
    effectiveLimit: discovered.length,
    results,
  };
}
