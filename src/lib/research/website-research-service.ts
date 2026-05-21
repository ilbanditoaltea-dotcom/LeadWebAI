import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import type { Json } from "@/src/lib/supabase/database.types";
import { crawlWithFirecrawl } from "@/src/lib/research/firecrawl";
import { crawlWithScrapingBee } from "@/src/lib/research/scrapingbee";

function toPlainText(value: string) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function pickMatches(raw: string, pattern: RegExp, limit: number) {
  return Array.from(raw.matchAll(pattern))
    .map((match) => (match[1] ?? match[0] ?? "").trim())
    .filter((item) => item.length > 0)
    .slice(0, limit);
}

function detectProblems(raw: string) {
  const plain = raw.toLowerCase();
  const issues: string[] = [];
  if (plain.includes("pdf")) issues.push("menú o contenido principal en PDF");
  if (!plain.includes("whatsapp")) issues.push("sin WhatsApp visible");
  if (!plain.includes("reserv")) issues.push("sin reservas online claras");
  if (!plain.includes("opin") && !plain.includes("review")) issues.push("falta prueba social");
  if (!plain.includes("seo") && !plain.includes("google")) issues.push("señales SEO local débiles");
  return issues;
}

export async function researchWebsite(params: {
  leadId: string;
  websiteUrl: string;
}) {
  const supabase = await createSupabaseServerClient();
  const fromFirecrawl = await crawlWithFirecrawl(params.websiteUrl);
  const fromScrapingBee = fromFirecrawl ? null : await crawlWithScrapingBee(params.websiteUrl);
  const fromFetch =
    fromFirecrawl || fromScrapingBee
      ? null
      : await (async () => {
          try {
            const response = await fetch(params.websiteUrl, {
              headers: {
                "User-Agent": "LeadWebAI-Research/1.0",
              },
              cache: "no-store",
            });
            return await response.text();
          } catch {
            return null;
          }
        })();

  const raw = fromFirecrawl ?? fromScrapingBee ?? fromFetch ?? "";
  const plain = toPlainText(raw);
  const title = pickMatches(raw, /<title[^>]*>([\s\S]*?)<\/title>/gi, 1)[0] ?? null;
  const metaDescription =
    pickMatches(raw, /<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)["']/gi, 1)[0] ??
    null;
  const headings = pickMatches(raw, /<h[1-3][^>]*>([\s\S]*?)<\/h[1-3]>/gi, 12);
  const links = pickMatches(raw, /href=["']([^"']+)["']/gi, 30);
  const ctas = pickMatches(
    plain,
    /\b(reservar|book|llamar|call|contactar|whatsapp|comprar|solicitar|cita)\b/gi,
    15,
  );
  const socials = links.filter((item) => /(instagram|facebook|tiktok|linkedin|youtube)/i.test(item));

  const extractedData = {
    headings,
    mainText: plain.slice(0, 8000),
    services: headings.filter((item) => /(servicio|tratamiento|service|producto|menu|carta)/i.test(item)),
    products: headings.filter((item) => /(producto|catalog|tienda|shop)/i.test(item)),
    menuHints: headings.filter((item) => /(menu|carta|dish|plato)/i.test(item)),
    ctas,
    importantLinks: links.slice(0, 12),
    socialLinks: socials,
  };

  const summary = plain.slice(0, 2000);
  const problems = detectProblems(raw);

  const { data, error } = await supabase
    .from("website_research")
    .insert({
      lead_id: params.leadId,
      website_url: params.websiteUrl,
      title,
      description: metaDescription,
      summary,
      extracted_data: extractedData as unknown as Json,
      detected_problems: problems as unknown as Json,
    })
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}
