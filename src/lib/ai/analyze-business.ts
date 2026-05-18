import { z } from "zod";
import { BUSINESS_TYPES, WEBSITE_GOALS } from "@/src/lib/types/ai-website";

export const analyzeBusinessInputSchema = z.object({
  leadId: z.string().min(1),
  businessName: z.string().min(1),
  category: z.string().optional().default("unknown"),
  city: z.string().optional().default("unknown"),
  description: z.string().optional().default("unknown"),
  websiteUrl: z.string().optional().default("unknown"),
  googleMapsUrl: z.string().optional().default("unknown"),
  instagramUrl: z.string().optional().default("unknown"),
});

export const analyzeBusinessOutputSchema = z.object({
  businessType: z.enum(BUSINESS_TYPES),
  opportunityScore: z.number().int().min(0).max(100),
  websiteQualityScore: z.number().int().min(0).max(100),
  targetCustomer: z.string(),
  mainGoal: z.enum(WEBSITE_GOALS),
  detectedProblems: z.array(z.string()),
  recommendations: z.array(z.string()),
  salesAngle: z.string(),
  suggestedMonthlyPlan: z.object({
    name: z.string(),
    price: z.string(),
    reason: z.string(),
    features: z.array(z.string()),
  }),
});

export type AnalyzeBusinessInput = z.infer<typeof analyzeBusinessInputSchema>;
export type AnalyzeBusinessOutput = z.infer<typeof analyzeBusinessOutputSchema>;
