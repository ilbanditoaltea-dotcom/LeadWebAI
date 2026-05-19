import { z } from "zod";
import { analyzeBusinessInputSchema } from "@/src/lib/ai/analyze-business";
import { generateCustomWebsiteInputSchema, generateCustomWebsiteOutputSchema } from "@/src/lib/ai/generate-custom-website";
import { generateSalesMessageInputSchema } from "@/src/lib/ai/generate-sales-message";

export const agentAnalyzeBusinessInputSchema = analyzeBusinessInputSchema;
export const agentGenerateWebsiteInputSchema = generateCustomWebsiteInputSchema;
export const agentGenerateMessageInputSchema = generateSalesMessageInputSchema;

export const agentRegenerateWebsiteInputSchema = z.object({
  generatedWebsiteId: z.string().min(1),
  currentWebsiteJson: generateCustomWebsiteOutputSchema,
  instruction: z.string().min(3),
  mode: z.enum(["style", "copy", "sections", "hero"]),
});

export const agentNextActionInputSchema = z.object({
  leadId: z.string().min(1),
  status: z.string().optional(),
  opportunityScore: z.number().int().min(0).max(100).nullable().optional(),
  websiteQualityScore: z.number().int().min(0).max(100).nullable().optional(),
  hasGeneratedWebsite: z.boolean().optional(),
  hasMessage: z.boolean().optional(),
});
