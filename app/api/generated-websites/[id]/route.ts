import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import type { Json } from "@/src/lib/supabase/database.types";
import {
  BUSINESS_TYPES,
  SECTION_TYPES,
  VISUAL_STYLES,
  WEBSITE_GOALS,
} from "@/src/lib/types/ai-website";

const colorPaletteSchema = z.object({
  primary: z.string(),
  secondary: z.string(),
  background: z.string(),
  text: z.string(),
  accent: z.string(),
});

const businessProfileSchema = z.object({
  businessName: z.string(),
  businessType: z.enum(BUSINESS_TYPES),
  city: z.string(),
  category: z.string(),
  targetCustomer: z.string(),
  mainGoal: z.enum(WEBSITE_GOALS),
  tone: z.string(),
  visualStyle: z.enum(VISUAL_STYLES),
  colorPalette: colorPaletteSchema,
  fontStyle: z.string(),
  imageStyle: z.string(),
});

const websiteSchema = z.object({
  hero: z.object({
    variant: z.string(),
    eyebrow: z.string(),
    title: z.string(),
    subtitle: z.string(),
    primaryCTA: z.string(),
    secondaryCTA: z.string(),
    backgroundImagePrompt: z.string(),
  }),
  sections: z.array(
    z.object({
      type: z.enum(SECTION_TYPES),
      variant: z.string(),
      title: z.string(),
      subtitle: z.string(),
      imagePrompt: z.string().optional(),
      imageAlt: z.string().optional(),
      items: z.array(z.unknown()),
      cta: z.string(),
      order: z.number().int().positive(),
    }),
  ),
  texts: z.unknown().optional(),
});

const updateGeneratedWebsiteSchema = z.object({
  businessProfile: businessProfileSchema.optional(),
  website: websiteSchema.optional(),
  seo: z.unknown().optional(),
  contact: z.unknown().optional(),
  confidence: z.unknown().optional(),
  status: z.string().optional(),
});

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const payload = updateGeneratedWebsiteSchema.parse(body);
    const websiteJson = payload.website as Json | undefined;
    const seoJson = payload.seo as Json | undefined;
    const contactJson = payload.contact as Json | undefined;
    const confidenceJson = payload.confidence as Json | undefined;

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("generated_websites")
      .update({
        business_profile: payload.businessProfile,
        website: websiteJson,
        seo: seoJson,
        contact: contactJson,
        confidence: confidenceJson,
        status: payload.status,
      })
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
