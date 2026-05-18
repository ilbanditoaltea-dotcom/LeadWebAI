import { z } from "zod";

export const platformBrandSettingsSchema = z.object({
  agencyName: z.string().default("LeadWeb AI"),
  logoUrl: z.string().default(""),
  primaryColor: z.string().default("#7c3aed"),
  salesRepName: z.string().default("unknown"),
  salesRepEmail: z.string().default("unknown"),
  salesRepPhone: z.string().default("unknown"),
  emailSignature: z.string().default("unknown"),
  legalDisclaimer: z
    .string()
    .default(
      "Revisa la normativa aplicable antes de enviar comunicaciones comerciales no solicitadas.",
    ),
  demoBaseDomain: z.string().default("unknown"),
});

export type PlatformBrandSettings = z.infer<typeof platformBrandSettingsSchema>;

export const defaultPlatformBrandSettings: PlatformBrandSettings =
  platformBrandSettingsSchema.parse({});

export function parsePlatformBrandSettings(input: unknown): PlatformBrandSettings {
  const parsed = platformBrandSettingsSchema.safeParse(input);
  if (!parsed.success) {
    return defaultPlatformBrandSettings;
  }
  return parsed.data;
}
