import OpenAI from "openai";
import { z } from "zod";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import { generateCustomWebsiteOutputSchema } from "@/src/lib/ai/generate-custom-website";
import type { Json } from "@/src/lib/supabase/database.types";

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

  const parsed = generateCustomWebsiteOutputSchema.parse(JSON.parse(raw));
  const mergedContact = preserveImportantContact(
    input.currentWebsiteJson.contact,
    parsed.contact,
  );

  const finalJson = {
    ...parsed,
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
