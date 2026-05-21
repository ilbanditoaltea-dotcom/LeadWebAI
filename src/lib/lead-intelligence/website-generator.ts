import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import type { Json } from "@/src/lib/supabase/database.types";
import {
  generatedWebsiteSchema,
  type BusinessIntelligenceProfile,
} from "@/src/lib/lead-intelligence/schemas";
import { WEBSITE_GENERATION_SYSTEM_PROMPT, buildWebsitePrompt } from "@/src/lib/lead-intelligence/prompts";
import { callOpenAiJson } from "@/src/lib/lead-intelligence/openai-client";
import { normalizeGeneratedWebsite } from "@/src/lib/lead-intelligence/normalize";
import { inferWebsiteStyle } from "@/src/lib/design-system/website-styles";

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

function fallbackWebsite(profile: BusinessIntelligenceProfile) {
  const style = inferWebsiteStyle(`${profile.identity.category} ${profile.identity.businessName}`);
  const sectionTypes = profile.websiteStrategy.sectionsToGenerate.slice(0, 10);
  const sections = sectionTypes.map((type, index) => ({
    type,
    variant: "default",
    title: `${type.replaceAll("_", " ")}`,
    subtitle: "Bloque estratégico generado.",
    items: [],
    cta: "Más información",
    order: index + 1,
    imagePrompt: `${profile.identity.businessName} ${type} visual`,
    imageAlt: `${type} visual`,
  }));

  return generatedWebsiteSchema.parse({
    businessProfile: {
      businessName: profile.identity.businessName,
      businessType: profile.identity.businessType,
      city: profile.identity.city,
      category: profile.identity.category,
      targetCustomer: profile.salesStrategy.targetCustomer,
      mainGoal: profile.salesStrategy.mainGoal,
      tone: profile.websiteStrategy.tone,
      visualStyle: style,
      colorPalette: {
        primary: profile.visualIdentity.primaryColor,
        secondary: profile.visualIdentity.secondaryColor,
        background: profile.visualIdentity.backgroundColor,
        text: profile.visualIdentity.textColor,
        accent: profile.visualIdentity.accentColor,
      },
      fontStyle: "Modern sans",
      imageStyle: "Local business photography",
    },
    website: {
      hero: {
        variant: "local_business",
        eyebrow: profile.identity.category,
        title: `${profile.identity.businessName}: web diseñada para convertir`,
        subtitle: profile.currentDigitalPresence.websiteSummary,
        primaryCTA: "Solicitar información",
        secondaryCTA: "Ver servicios",
        backgroundImagePrompt: profile.visualIdentity.heroImagePrompt,
      },
      sections,
    },
    seo: {
      title: `${profile.identity.businessName} | ${profile.identity.city}`,
      description: profile.marketSignals.localOpportunity,
      keywords: [
        profile.identity.businessName.toLowerCase(),
        profile.identity.category.toLowerCase(),
        profile.identity.city.toLowerCase(),
      ],
    },
    contact: {
      phone: profile.identity.phone,
      email: null,
      whatsapp: profile.identity.phone,
      address: profile.identity.address,
    },
    confidence: {
      reasoning: `Style selected from profile: ${style}. ${profile.websiteStrategy.structureReasoning}`,
      salesAngle: profile.salesStrategy.mainSalesAngle,
      detectedProblems: profile.currentDigitalPresence.detectedProblems,
      recommendedFeatures: profile.salesStrategy.recommendedFeatures,
    },
  });
}

async function buildUniqueDemoSlug(baseName: string) {
  const supabase = await createSupabaseServerClient();
  const base = slugify(baseName) || "demo";
  const { data } = await supabase
    .from("generated_websites")
    .select("demo_slug")
    .ilike("demo_slug", `${base}%`);
  if (!data?.length) return base;
  return `${base}-${data.length + 1}`;
}

export async function generateWebsiteFromBusinessProfile(params: {
  leadId: string;
  profile: BusinessIntelligenceProfile;
  instruction?: string;
}) {
  const supabase = await createSupabaseServerClient();
  const aiWebsite = await callOpenAiJson({
    system: WEBSITE_GENERATION_SYSTEM_PROMPT,
    user: buildWebsitePrompt({
      businessProfile: params.profile,
      instruction: params.instruction,
    }),
    schema: generatedWebsiteSchema,
    jsonSchemaName: "generated_website",
    model: "gpt-4.1-mini",
  });
  const normalized = normalizeGeneratedWebsite(aiWebsite ?? fallbackWebsite(params.profile));
  const demoSlug = await buildUniqueDemoSlug(normalized.businessProfile.businessName);

  const { data, error } = await supabase
    .from("generated_websites")
    .insert({
      lead_id: params.leadId,
      business_profile: normalized.businessProfile as unknown as Json,
      website: normalized.website as unknown as Json,
      seo: normalized.seo as unknown as Json,
      contact: normalized.contact as unknown as Json,
      confidence: normalized.confidence as unknown as Json,
      demo_slug: demoSlug,
      status: "draft",
    })
    .select("*")
    .maybeSingle();
  if (error || !data) {
    throw new Error(error?.message ?? "Failed to save generated website");
  }

  await supabase
    .from("leads")
    .update({ status: "website_generated" })
    .eq("id", params.leadId);

  return {
    website: normalized,
    generatedWebsite: data,
    demoSlug,
  };
}
