import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import type { Json } from "@/src/lib/supabase/database.types";
import { buildBusinessIntelligenceProfile } from "@/src/lib/research/business-profile";
import { enrichedPlaceSchema } from "@/src/lib/discovery/places";

const inputSchema = z.object({
  leadId: z.string().optional(),
  lead: z
    .object({
      id: z.string(),
      businessName: z.string(),
      category: z.string(),
      city: z.string(),
      description: z.string().default(""),
      websiteUrl: z.string().default("unknown"),
      phone: z.string().default("unknown"),
      address: z.string().default("unknown"),
      googleMapsUrl: z.string().default("unknown"),
      detectedProblems: z.array(z.string()).default([]),
      recommendations: z.array(z.string()).default([]),
    })
    .optional(),
  enrichedPlace: enrichedPlaceSchema.optional(),
  websiteCrawlSummary: z.string().optional(),
});

export const runtime = "nodejs";
export const maxDuration = 60;

async function crawlWebsiteSummary(url: string) {
  if (!url || url === "unknown") return "";
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "LeadWebAI-Research/1.0 (+https://leadweb-ai.vercel.app)",
      },
      cache: "no-store",
    });
    const html = await response.text();
    return html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").slice(0, 5000);
  } catch {
    return "";
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = inputSchema.parse(body);
    const supabase = await createSupabaseServerClient();

    let lead = input.lead;
    if (!lead && input.leadId) {
      const { data: dbLead } = await supabase
        .from("leads")
        .select("*")
        .eq("id", input.leadId)
        .maybeSingle();
      if (!dbLead) {
        return NextResponse.json({ error: "Lead no encontrado." }, { status: 404 });
      }

      lead = {
        id: dbLead.id,
        businessName: dbLead.business_name,
        category: dbLead.category ?? "unknown",
        city: dbLead.city ?? "unknown",
        description: dbLead.description ?? "",
        websiteUrl: dbLead.website_url ?? "unknown",
        phone: dbLead.phone ?? "unknown",
        address: dbLead.address ?? "unknown",
        googleMapsUrl: dbLead.google_maps_url ?? "unknown",
        detectedProblems:
          Array.isArray(dbLead.detected_problems) &&
          dbLead.detected_problems.every((item) => typeof item === "string")
            ? (dbLead.detected_problems as string[])
            : [],
        recommendations:
          Array.isArray(dbLead.recommendations) &&
          dbLead.recommendations.every((item) => typeof item === "string")
            ? (dbLead.recommendations as string[])
            : [],
      };
    }

    if (!lead) {
      return NextResponse.json(
        { error: "Debes enviar leadId o lead completo." },
        { status: 400 },
      );
    }

    const websiteCrawlSummary =
      input.websiteCrawlSummary ?? (await crawlWebsiteSummary(input.enrichedPlace?.websiteUrl ?? lead.websiteUrl));

    const profile = await buildBusinessIntelligenceProfile({
      lead,
      enrichedPlace: input.enrichedPlace,
      websiteCrawlSummary,
    });

    await supabase.from("activities").insert({
      lead_id: lead.id,
      type: "research_business_profile",
      description: "BusinessIntelligenceProfile generado.",
      metadata: profile as unknown as Json,
    });

    return NextResponse.json({
      leadId: lead.id,
      profile,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
