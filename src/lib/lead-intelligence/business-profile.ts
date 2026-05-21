import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import type { Json } from "@/src/lib/supabase/database.types";
import { inferWebsiteStyle } from "@/src/lib/design-system/website-styles";
import { businessIntelligenceProfileSchema } from "@/src/lib/lead-intelligence/schemas";
import {
  BUSINESS_PROFILE_SYSTEM_PROMPT,
  buildBusinessProfilePrompt,
} from "@/src/lib/lead-intelligence/prompts";
import { callOpenAiJson } from "@/src/lib/lead-intelligence/openai-client";
import { normalizeBusinessProfile } from "@/src/lib/lead-intelligence/normalize";

function fallbackProfile(input: {
  lead: {
    id: string;
    business_name: string;
    category: string | null;
    city: string | null;
    address: string | null;
    phone: string | null;
    website_url: string | null;
    google_maps_url: string | null;
    rating: number | null;
    review_count: number | null;
  };
  websiteSummary: string;
  detectedProblems: string[];
}) {
  const category = input.lead.category ?? "generic";
  const style = inferWebsiteStyle(`${category} ${input.lead.business_name}`);
  return businessIntelligenceProfileSchema.parse({
    identity: {
      businessName: input.lead.business_name,
      category,
      businessType: category,
      city: input.lead.city ?? "unknown",
      address: input.lead.address,
      phone: input.lead.phone,
      websiteUrl: input.lead.website_url,
      googleMapsUrl: input.lead.google_maps_url,
    },
    marketSignals: {
      rating: input.lead.rating,
      reviewCount: input.lead.review_count,
      reviewHighlights: [],
      competitivePosition: "Negocio local con oportunidad de mejorar conversión digital.",
      localOpportunity: `Captar más clientes en ${input.lead.city ?? "su zona local"} con una web más efectiva.`,
    },
    currentDigitalPresence: {
      hasWebsite: Boolean(input.lead.website_url && input.lead.website_url !== "unknown"),
      websiteSummary: input.websiteSummary || "Sin investigación web completa.",
      detectedProblems: input.detectedProblems,
      missingFeatures: ["CTA visible", "prueba social", "captación móvil"],
      strengths: ["Base local existente", "presencia en Maps"],
    },
    visualIdentity: {
      recommendedStyle: style,
      primaryColor: "#4f46e5",
      secondaryColor: "#a78bfa",
      backgroundColor: "#f8fafc",
      textColor: "#0f172a",
      accentColor: "#06b6d4",
      heroImagePrompt: `Professional hero shot of ${input.lead.business_name} in ${input.lead.city ?? "Spain"} with style ${style}`,
    },
    salesStrategy: {
      mainGoal: "Mejorar negocio online y aumentar conversión.",
      targetCustomer: "Clientes locales con intención alta de compra.",
      mainSalesAngle: "Web profesional orientada a conversión y confianza local.",
      recommendedFeatures: ["WhatsApp", "CTA sticky", "Reseñas visibles", "Bloques de confianza"],
      planName: "Growth Local",
      planPrice: "127 EUR/mes",
    },
    websiteStrategy: {
      structureReasoning: "Se priorizan bloques de confianza + acción para acelerar contacto.",
      sectionsToGenerate: ["services", "reviews", "gallery", "contact", "process", "final_cta"],
      tone: "Profesional y cercano",
      ctaStrategy: "CTA principal arriba y CTA de cierre con urgencia suave.",
    },
  });
}

export async function createBusinessProfileFromLead(params: {
  leadId: string;
  instruction?: string;
}) {
  const supabase = await createSupabaseServerClient();
  const { data: lead } = await supabase.from("leads").select("*").eq("id", params.leadId).maybeSingle();
  if (!lead) {
    throw new Error("Lead not found.");
  }

  const [{ data: placeData }, { data: websiteResearch }] = await Promise.all([
    supabase
      .from("places_data")
      .select("*")
      .eq("lead_id", params.leadId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from("website_research")
      .select("*")
      .eq("lead_id", params.leadId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const fallback = fallbackProfile({
    lead,
    websiteSummary: websiteResearch?.summary ?? "",
    detectedProblems:
      Array.isArray(websiteResearch?.detected_problems) &&
      websiteResearch.detected_problems.every((item) => typeof item === "string")
        ? (websiteResearch.detected_problems as string[])
        : [],
  });

  const aiProfile = await callOpenAiJson({
    system: BUSINESS_PROFILE_SYSTEM_PROMPT,
    user: buildBusinessProfilePrompt({
      lead,
      placeData: placeData?.raw_data ?? null,
      websiteResearch: websiteResearch ?? null,
      instruction: params.instruction,
    }),
    schema: businessIntelligenceProfileSchema,
    jsonSchemaName: "business_intelligence_profile",
    model: "gpt-4.1-mini",
  });

  const profile = normalizeBusinessProfile(aiProfile ?? fallback);

  const { data: saved, error } = await supabase
    .from("business_profiles")
    .upsert(
      {
        lead_id: params.leadId,
        profile: profile as unknown as Json,
      },
      { onConflict: "lead_id" },
    )
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  await supabase
    .from("leads")
    .update({ status: "analyzed" })
    .eq("id", params.leadId);

  return {
    lead,
    profile,
    businessProfileRow: saved,
    placeData,
    websiteResearch,
  };
}
