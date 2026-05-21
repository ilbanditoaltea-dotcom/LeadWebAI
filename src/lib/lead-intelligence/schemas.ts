import { z } from "zod";

export const businessIntelligenceProfileSchema = z.object({
  identity: z.object({
    businessName: z.string(),
    category: z.string(),
    businessType: z.string(),
    city: z.string(),
    address: z.string().nullable(),
    phone: z.string().nullable(),
    websiteUrl: z.string().nullable(),
    googleMapsUrl: z.string().nullable(),
  }),
  marketSignals: z.object({
    rating: z.number().nullable(),
    reviewCount: z.number().nullable(),
    reviewHighlights: z.array(z.string()),
    competitivePosition: z.string(),
    localOpportunity: z.string(),
  }),
  currentDigitalPresence: z.object({
    hasWebsite: z.boolean(),
    websiteSummary: z.string(),
    detectedProblems: z.array(z.string()),
    missingFeatures: z.array(z.string()),
    strengths: z.array(z.string()),
  }),
  visualIdentity: z.object({
    recommendedStyle: z.string(),
    primaryColor: z.string(),
    secondaryColor: z.string(),
    backgroundColor: z.string(),
    textColor: z.string(),
    accentColor: z.string(),
    heroImagePrompt: z.string(),
  }),
  salesStrategy: z.object({
    mainGoal: z.string(),
    targetCustomer: z.string(),
    mainSalesAngle: z.string(),
    recommendedFeatures: z.array(z.string()),
    planName: z.string(),
    planPrice: z.string(),
  }),
  websiteStrategy: z.object({
    structureReasoning: z.string(),
    sectionsToGenerate: z.array(z.string()).min(6).max(10),
    tone: z.string(),
    ctaStrategy: z.string(),
  }),
});

export const generatedWebsiteSchema = z.object({
  businessProfile: z.object({
    businessName: z.string(),
    businessType: z.string(),
    city: z.string(),
    category: z.string(),
    targetCustomer: z.string(),
    mainGoal: z.string(),
    tone: z.string(),
    visualStyle: z.string(),
    colorPalette: z.object({
      primary: z.string(),
      secondary: z.string(),
      background: z.string(),
      text: z.string(),
      accent: z.string(),
    }),
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
      .array(
        z.object({
          type: z.string(),
          variant: z.string(),
          title: z.string(),
          subtitle: z.string(),
          items: z.array(z.unknown()),
          cta: z.string(),
          order: z.number().int().positive(),
          imagePrompt: z.string(),
          imageAlt: z.string(),
        }),
      )
      .min(6)
      .max(10),
  }),
  seo: z.object({
    title: z.string(),
    description: z.string(),
    keywords: z.array(z.string()),
  }),
  contact: z.object({
    phone: z.string().nullable(),
    email: z.string().nullable(),
    whatsapp: z.string().nullable(),
    address: z.string().nullable(),
  }),
  confidence: z.object({
    reasoning: z.string(),
    salesAngle: z.string(),
    detectedProblems: z.array(z.string()),
    recommendedFeatures: z.array(z.string()),
  }),
});

export const fullPipelineInputSchema = z.object({
  leadId: z.string().uuid(),
  instruction: z.string().optional(),
});

export type BusinessIntelligenceProfile = z.infer<typeof businessIntelligenceProfileSchema>;
export type GeneratedWebsiteOutput = z.infer<typeof generatedWebsiteSchema>;
