import OpenAI from "openai";
import { z } from "zod";

const websiteIntelligenceSchema = z.object({
  brandColors: z.array(z.string()).max(6).default([]),
  menuHighlights: z.array(z.string()).max(8).default([]),
  serviceHighlights: z.array(z.string()).max(8).default([]),
  toneDescriptors: z.array(z.string()).max(6).default([]),
  visualNotes: z.array(z.string()).max(6).default([]),
  ctaHints: z.array(z.string()).max(6).default([]),
});

export type WebsiteIntelligence = z.infer<typeof websiteIntelligenceSchema>;

const defaultWebsiteIntelligence: WebsiteIntelligence = {
  brandColors: [],
  menuHighlights: [],
  serviceHighlights: [],
  toneDescriptors: [],
  visualNotes: [],
  ctaHints: [],
};

function isUsableOpenAiKey(value: string | undefined) {
  return Boolean(value && value.startsWith("sk-") && value !== "tu_api_key");
}

async function fetchWebsiteSnapshot(url: string): Promise<string> {
  if (!url || url === "unknown") return "";
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 9000);
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent": "LeadWebAI-WebsiteIntel/1.0 (+https://leadweb-ai.vercel.app)",
      },
    });
    clearTimeout(timeout);
    const html = await response.text();
    return html.slice(0, 12000);
  } catch {
    return "";
  }
}

function normalizeHex(value: string) {
  const match = value.match(/#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})\b/);
  return match ? match[0].toUpperCase() : null;
}

function fallbackIntel(raw: string): WebsiteIntelligence {
  const colors = Array.from(raw.matchAll(/#[0-9a-fA-F]{3,6}\b/g))
    .map((item) => normalizeHex(item[0]))
    .filter((item): item is string => Boolean(item))
    .slice(0, 6);

  const lines = raw
    .replace(/<[^>]+>/g, " ")
    .split(/[\n\r\.]/g)
    .map((line) => line.trim())
    .filter((line) => line.length >= 6 && line.length <= 80);

  const menuHints = lines
    .filter((line) => /(menu|carta|pizza|pasta|burger|sushi|ensalada|postre|desayuno|tapa)/i.test(line))
    .slice(0, 6);

  const ctaHints = lines
    .filter((line) => /(reserv|book|pedido|order|call|whatsapp|cita|appointment)/i.test(line))
    .slice(0, 6);

  return {
    ...defaultWebsiteIntelligence,
    brandColors: colors,
    menuHighlights: menuHints,
    ctaHints,
  };
}

export async function extractWebsiteIntelligence(params: {
  websiteUrl?: string;
  businessName: string;
  category: string;
  city: string;
  fallbackText?: string;
}): Promise<WebsiteIntelligence> {
  const snapshot = await fetchWebsiteSnapshot(params.websiteUrl ?? "unknown");
  const rawContext = `${snapshot}\n\n${params.fallbackText ?? ""}`.trim();
  if (!rawContext) return defaultWebsiteIntelligence;

  const openAiApiKey = process.env.OPENAI_API_KEY;
  if (!isUsableOpenAiKey(openAiApiKey)) {
    return fallbackIntel(rawContext);
  }

  try {
    const openai = new OpenAI({ apiKey: openAiApiKey });
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You extract website style and offer intelligence for sales personalization. Return valid JSON only.",
        },
        {
          role: "user",
          content: `Extract structured intelligence for this business:
businessName: ${params.businessName}
category: ${params.category}
city: ${params.city}

Source content:
${rawContext.slice(0, 14000)}

Return JSON:
{
  "brandColors": ["#HEX"],
  "menuHighlights": [""],
  "serviceHighlights": [""],
  "toneDescriptors": [""],
  "visualNotes": [""],
  "ctaHints": [""]
}

Rules:
- Keep concise factual hints.
- If data is missing, return empty arrays.
- Colors must be HEX when possible.`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) return fallbackIntel(rawContext);
    const parsed = websiteIntelligenceSchema.safeParse(JSON.parse(raw));
    if (!parsed.success) return fallbackIntel(rawContext);
    return parsed.data;
  } catch {
    return fallbackIntel(rawContext);
  }
}
