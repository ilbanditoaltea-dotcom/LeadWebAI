import OpenAI from "openai";
import { z } from "zod";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import {
  generateCustomWebsiteOutputSchema,
  type GenerateCustomWebsiteOutput,
} from "@/src/lib/ai/generate-custom-website";
import type { Json } from "@/src/lib/supabase/database.types";
import { VISUAL_STYLES, type VisualStyle } from "@/src/lib/types/ai-website";

export type RegenerationMode = "style" | "copy" | "sections" | "hero";

export const regenerateWebsiteInputSchema = z.object({
  generatedWebsiteId: z.string().min(1),
  currentWebsiteJson: generateCustomWebsiteOutputSchema,
  instruction: z.string().min(3),
});

export type RegenerateWebsiteInput = z.infer<typeof regenerateWebsiteInputSchema>;

function modeGuidance(mode: RegenerationMode) {
  if (mode === "style") {
    return "Regenerate only visual style decisions: visualStyle, tone, colorPalette, fontStyle, imageStyle, and text micro-adjustments if needed.";
  }

  if (mode === "copy") {
    return "Regenerate only copy/text content: hero text, section text, CTAs, SEO copy, salesAngle. Keep structure and style coherent.";
  }

  if (mode === "sections") {
    return "Regenerate sections list and section ordering for better conversion while keeping business context. Keep 6-10 sections, keep final_cta.";
  }

  return "Regenerate hero only: eyebrow, title, subtitle, CTAs, backgroundImagePrompt, and variant.";
}

function sanitizeString(value: string | undefined) {
  if (!value) return "unknown";
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : "unknown";
}

function preserveImportantContact(
  current: z.infer<typeof generateCustomWebsiteOutputSchema>["contact"],
  incoming: z.infer<typeof generateCustomWebsiteOutputSchema>["contact"],
) {
  const mergeField = (nextValue: string, currentValue: string) => {
    const normalizedNext = sanitizeString(nextValue).toLowerCase();
    if (normalizedNext === "unknown") {
      return sanitizeString(currentValue);
    }
    return sanitizeString(nextValue);
  };

  return {
    phone: mergeField(incoming.phone, current.phone),
    email: mergeField(incoming.email, current.email),
    whatsapp: mergeField(incoming.whatsapp, current.whatsapp),
    address: mergeField(incoming.address, current.address),
  };
}

function paletteByStyle(style: VisualStyle) {
  const byStyle: Record<
    VisualStyle,
    { primary: string; secondary: string; background: string; text: string; accent: string }
  > = {
    premium_dark: { primary: "#1D4ED8", secondary: "#38BDF8", background: "#0B1020", text: "#E2E8F0", accent: "#F59E0B" },
    rustic_mediterranean: { primary: "#92400E", secondary: "#D97706", background: "#FFFBEB", text: "#3F3F46", accent: "#0F766E" },
    clean_medical: { primary: "#2563EB", secondary: "#14B8A6", background: "#F8FAFC", text: "#0F172A", accent: "#8B5CF6" },
    vintage_barbershop: { primary: "#111827", secondary: "#B45309", background: "#0B0F19", text: "#F5F5F4", accent: "#DC2626" },
    luxury_real_estate: { primary: "#0F4C81", secondary: "#CBD5E1", background: "#F8FAFC", text: "#0F172A", accent: "#F59E0B" },
    playful_academy: { primary: "#2563EB", secondary: "#F59E0B", background: "#F0F9FF", text: "#1E293B", accent: "#10B981" },
    natural_wellness: { primary: "#166534", secondary: "#84CC16", background: "#F7FEE7", text: "#14532D", accent: "#0EA5E9" },
    urban_fitness: { primary: "#4338CA", secondary: "#22D3EE", background: "#F8FAFC", text: "#0F172A", accent: "#F43F5E" },
    industrial_automotive: { primary: "#1E293B", secondary: "#64748B", background: "#F8FAFC", text: "#0F172A", accent: "#F97316" },
    boutique_hotel: { primary: "#334155", secondary: "#A78BFA", background: "#F8FAFC", text: "#0F172A", accent: "#D97706" },
    warm_restaurant: { primary: "#B45309", secondary: "#FB7185", background: "#FFF7ED", text: "#292524", accent: "#84CC16" },
    modern_minimal: { primary: "#475569", secondary: "#A78BFA", background: "#F8FAFC", text: "#0F172A", accent: "#06B6D4" },
    luxury: { primary: "#BE185D", secondary: "#F9A8D4", background: "#FFF1F2", text: "#3F3F46", accent: "#7C3AED" },
    playful: { primary: "#2563EB", secondary: "#F59E0B", background: "#F0F9FF", text: "#1E293B", accent: "#10B981" },
    industrial: { primary: "#1E293B", secondary: "#F97316", background: "#F8FAFC", text: "#0F172A", accent: "#0EA5E9" },
    natural: { primary: "#166534", secondary: "#4ADE80", background: "#F7FEE7", text: "#14532D", accent: "#EAB308" },
    corporate: { primary: "#0F4C81", secondary: "#38BDF8", background: "#F8FAFC", text: "#0F172A", accent: "#F97316" },
    mediterranean: { primary: "#B91C1C", secondary: "#F59E0B", background: "#FFF7ED", text: "#1F2937", accent: "#15803D" },
    vintage: { primary: "#111827", secondary: "#D97706", background: "#0B0F19", text: "#F8FAFC", accent: "#B91C1C" },
    urban: { primary: "#4338CA", secondary: "#22D3EE", background: "#F8FAFC", text: "#0F172A", accent: "#F43F5E" },
  };
  return byStyle[style];
}

function styleFromInstruction(instruction: string, current: VisualStyle): VisualStyle {
  const value = instruction.toLowerCase();
  if (value.includes("lux") && value.includes("estate")) return "luxury_real_estate";
  if (value.includes("lux")) return "luxury";
  if (value.includes("minimal")) return "modern_minimal";
  if (value.includes("vintage") && value.includes("barber")) return "vintage_barbershop";
  if (value.includes("vintage")) return "vintage";
  if (value.includes("natural") || value.includes("eco")) return "natural_wellness";
  if (value.includes("dark") || value.includes("oscuro")) return "premium_dark";
  if (value.includes("mediterr")) return "rustic_mediterranean";
  if (value.includes("urban") && value.includes("fit")) return "urban_fitness";
  if (value.includes("urban")) return "urban";
  if (value.includes("academy") || value.includes("playful")) return "playful_academy";
  if (value.includes("automotive") || value.includes("industrial")) return "industrial_automotive";
  if (value.includes("hotel") || value.includes("boutique")) return "boutique_hotel";

  const idx = VISUAL_STYLES.indexOf(current);
  const nextIndex = idx >= 0 ? (idx + 1) % VISUAL_STYLES.length : 0;
  return VISUAL_STYLES[nextIndex];
}

function buildDeterministicFallback(
  mode: RegenerationMode,
  current: GenerateCustomWebsiteOutput,
  instruction: string,
): GenerateCustomWebsiteOutput {
  if (mode === "style") {
    const nextStyle = styleFromInstruction(instruction, current.businessProfile.visualStyle);
    return {
      ...current,
      businessProfile: {
        ...current.businessProfile,
        visualStyle: nextStyle,
        colorPalette: paletteByStyle(nextStyle),
        tone: `Updated style direction: ${instruction}`,
      },
    };
  }

  if (mode === "copy") {
    return {
      ...current,
      website: {
        ...current.website,
        hero: {
          ...current.website.hero,
          subtitle: `${current.website.hero.subtitle} (${instruction})`,
        },
      },
      confidence: {
        ...current.confidence,
        salesAngle: `${current.confidence.salesAngle} (${instruction})`,
      },
    };
  }

  if (mode === "hero") {
    return {
      ...current,
      website: {
        ...current.website,
        hero: {
          ...current.website.hero,
          title: `${current.website.hero.title} - actualizado`,
          subtitle: `${current.website.hero.subtitle} (${instruction})`,
        },
      },
    };
  }

  return current;
}

export async function regenerateWebsitePartial(
  mode: RegenerationMode,
  input: RegenerateWebsiteInput,
) {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === "tu_api_key") {
    throw new Error("OPENAI_API_KEY is missing or invalid.");
  }

  const openai = new OpenAI({ apiKey });
  const guidance = modeGuidance(mode);
  const supabase = await createSupabaseServerClient();

  const { data: currentRecord, error: currentRecordError } = await supabase
    .from("generated_websites")
    .select("*")
    .eq("id", input.generatedWebsiteId)
    .maybeSingle();

  if (currentRecordError || !currentRecord) {
    throw new Error("Current generated website was not found.");
  }

  const { data: latestVersion } = await supabase
    .from("generated_website_versions")
    .select("version_number")
    .eq("generated_website_id", input.generatedWebsiteId)
    .order("version_number", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextVersionNumber = (latestVersion?.version_number ?? 0) + 1;

  const { error: versionInsertError } = await supabase
    .from("generated_website_versions")
    .insert({
      generated_website_id: input.generatedWebsiteId,
      version_number: nextVersionNumber,
      change_type: mode,
      instruction: input.instruction,
      snapshot: {
        businessProfile: currentRecord.business_profile,
        website: currentRecord.website,
        seo: currentRecord.seo,
        contact: currentRecord.contact,
        confidence: currentRecord.confidence,
      },
    });

  if (versionInsertError) {
    throw new Error(`Failed to save previous version: ${versionInsertError.message}`);
  }

  const completion = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    temperature: 0.45,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content:
          "You are a senior CRO and web strategy specialist. Return only valid JSON, no markdown. Keep the same schema. Do not remove essential contact data. Keep commercial objective optimization.",
      },
      {
        role: "user",
        content: `Regeneration mode: ${mode}
Instruction: ${input.instruction}

Current website JSON:
${JSON.stringify(input.currentWebsiteJson)}

Rules:
- Return the same JSON schema exactly.
- Do not break structure.
- Keep conversion objective strong.
- Preserve core contact data.
- Avoid deleting important business context.
- ${guidance}`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content;
  if (!raw) {
    throw new Error("OpenAI returned empty content.");
  }

  let rawJson: unknown = null;
  try {
    rawJson = JSON.parse(raw);
  } catch {
    rawJson = null;
  }
  const parsed = rawJson
    ? generateCustomWebsiteOutputSchema.safeParse(rawJson)
    : { success: false as const };
  const validOutput = parsed.success
    ? parsed.data
    : buildDeterministicFallback(mode, input.currentWebsiteJson, input.instruction);
  const mergedContact = preserveImportantContact(
    input.currentWebsiteJson.contact,
    validOutput.contact,
  );

  const finalJson = {
    ...validOutput,
    contact: mergedContact,
  };
  const websiteJson = finalJson.website as unknown as Json;
  const seoJson = finalJson.seo as unknown as Json;
  const contactJson = finalJson.contact as unknown as Json;
  const confidenceJson = finalJson.confidence as unknown as Json;

  const { error } = await supabase
    .from("generated_websites")
    .update({
      business_profile: finalJson.businessProfile,
      website: websiteJson,
      seo: seoJson,
      contact: contactJson,
      confidence: confidenceJson,
      status: "draft",
    })
    .eq("id", input.generatedWebsiteId);

  if (error) {
    throw new Error(`Failed to save regenerated website: ${error.message}`);
  }

  return finalJson;
}
