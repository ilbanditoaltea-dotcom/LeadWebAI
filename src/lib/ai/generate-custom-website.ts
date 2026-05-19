import { z } from "zod";
import {
  BUSINESS_TYPES,
  VISUAL_STYLES,
  WEBSITE_GOALS,
} from "@/src/lib/types/ai-website";
import { businessIntelligenceProfileSchema } from "@/src/lib/research/business-profile";

export const generateCustomWebsiteInputSchema = z.object({
  leadId: z.string().min(1),
  businessName: z.string().min(1),
  category: z.string().optional().default("unknown"),
  city: z.string().optional().default("unknown"),
  description: z.string().optional().default("unknown"),
  phone: z.string().optional().default("unknown"),
  email: z.string().optional().default("unknown"),
  whatsapp: z.string().optional().default("unknown"),
  address: z.string().optional().default("unknown"),
  websiteUrl: z.string().optional().default("unknown"),
  detectedProblems: z.array(z.string()).optional().default([]),
  recommendations: z.array(z.string()).optional().default([]),
  targetGoal: z.enum(WEBSITE_GOALS),
});

export const generateCustomWebsiteFromBipInputSchema = z.object({
  leadId: z.string().min(1),
  businessProfile: businessIntelligenceProfileSchema,
});

const colorPaletteSchema = z.object({
  primary: z.string(),
  secondary: z.string(),
  background: z.string(),
  text: z.string(),
  accent: z.string(),
});

const sectionSchema = z.object({
  type: z.string().min(1),
  variant: z.string(),
  title: z.string(),
  subtitle: z.string(),
  imagePrompt: z.string().optional().default("unknown"),
  imageAlt: z.string().optional().default("Imagen sugerida por IA"),
  items: z.array(z.unknown()),
  cta: z.string(),
  order: z.number().int().positive(),
});

export const generateCustomWebsiteOutputSchema = z.object({
  businessProfile: z.object({
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
  }),
  website: z.object({
    hero: z.object({
      variant: z.string(),
      eyebrow: z.string(),
      title: z.string(),
      subtitle: z.string(),
      primaryCTA: z.string(),
      secondaryCTA: z.string(),
      backgroundImagePrompt: z.string(),
    }),
    sections: z
      .array(sectionSchema)
      .min(6)
      .max(10)
      .refine(
        (sections) => sections.some((section) => section.type === "final_cta"),
        "sections must include final_cta",
      ),
  }),
  seo: z.object({
    title: z.string(),
    description: z.string(),
    keywords: z.array(z.string()),
  }),
  contact: z.object({
    phone: z.string(),
    email: z.string(),
    whatsapp: z.string(),
    address: z.string(),
  }),
  confidence: z.object({
    reasoning: z.string(),
    salesAngle: z.string(),
    detectedProblems: z.array(z.string()),
    recommendedFeatures: z.array(z.string()),
  }),
});

export type GenerateCustomWebsiteInput = z.infer<
  typeof generateCustomWebsiteInputSchema
>;
export type GenerateCustomWebsiteOutput = z.infer<
  typeof generateCustomWebsiteOutputSchema
>;
