import { z } from "zod";

export const salesChannelSchema = z.enum([
  "email",
  "whatsapp",
  "instagram_dm",
  "call_script",
]);

export const generateSalesMessageInputSchema = z.object({
  lead: z
    .object({
      id: z.string().min(1),
      businessName: z.string().optional(),
      business_name: z.string().optional(),
      detectedProblems: z.array(z.string()).optional(),
      detected_problems: z.array(z.string()).optional(),
      city: z.string().optional(),
      category: z.string().optional(),
    })
    .passthrough(),
  generatedWebsite: z
    .object({
      id: z.string().optional(),
      demo_slug: z.string().optional(),
      demoUrl: z.string().optional(),
    })
    .passthrough()
    .nullable(),
  channel: salesChannelSchema,
});

export const generateSalesMessageOutputSchema = z.object({
  channel: salesChannelSchema,
  subject: z.string(),
  body: z.string(),
  personalizationPoints: z.array(z.string()),
  mainSalesAngle: z.string(),
  cta: z.string(),
  riskNotes: z.array(z.string()),
});

export type GenerateSalesMessageInput = z.infer<
  typeof generateSalesMessageInputSchema
>;
export type GenerateSalesMessageOutput = z.infer<
  typeof generateSalesMessageOutputSchema
>;

export function applyChannelLengthRules(
  message: GenerateSalesMessageOutput,
): GenerateSalesMessageOutput {
  if (message.channel === "whatsapp" && message.body.length > 700) {
    return { ...message, body: `${message.body.slice(0, 697)}...` };
  }

  if (message.channel === "instagram_dm" && message.body.length > 500) {
    return { ...message, body: `${message.body.slice(0, 497)}...` };
  }

  return message;
}
