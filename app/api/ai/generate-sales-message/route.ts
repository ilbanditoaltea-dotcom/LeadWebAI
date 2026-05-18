import OpenAI from "openai";
import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import {
  applyChannelLengthRules,
  generateSalesMessageInputSchema,
  generateSalesMessageOutputSchema,
} from "@/src/lib/ai/generate-sales-message";
import {
  defaultPlatformBrandSettings,
  parsePlatformBrandSettings,
} from "@/src/lib/settings/platform-brand";

export async function POST(request: Request) {
  const openAiApiKey = process.env.OPENAI_API_KEY;
  if (!openAiApiKey || openAiApiKey === "tu_api_key") {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is missing or invalid." },
      { status: 500 },
    );
  }

  try {
    const body = await request.json();
    const input = generateSalesMessageInputSchema.parse(body);
    const openai = new OpenAI({ apiKey: openAiApiKey });

    const businessName =
      input.lead.businessName ?? input.lead.business_name ?? "este negocio";
    const detectedProblems =
      input.lead.detectedProblems ?? input.lead.detected_problems ?? [];

    const supabase = await createSupabaseServerClient();
    const { data: settingsRow } = await supabase
      .from("settings")
      .select("*")
      .eq("key", "platform_brand")
      .maybeSingle();
    const brandSettings = settingsRow?.value
      ? parsePlatformBrandSettings(settingsRow.value)
      : defaultPlatformBrandSettings;

    const baseDomain = brandSettings.demoBaseDomain;
    const demoUrl =
      (baseDomain !== "unknown" && baseDomain
        ? input.generatedWebsite?.demo_slug
          ? `${baseDomain.replace(/\/$/, "")}/demo/${input.generatedWebsite.demo_slug}`
          : input.generatedWebsite?.id
            ? `${baseDomain.replace(/\/$/, "")}/demo/${input.generatedWebsite.id}`
            : undefined
        : undefined) ??
      input.generatedWebsite?.demoUrl ??
      (input.generatedWebsite?.demo_slug
        ? `/demo/${input.generatedWebsite.demo_slug}`
        : input.generatedWebsite?.id
          ? `/demo/${input.generatedWebsite.id}`
          : "unknown");

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.35,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a senior local-business sales consultant. Return only JSON. Keep messages short, natural, not spammy, specific, and honest.",
        },
        {
          role: "user",
          content: `Create a suggested sales message in JSON.

Input:
- channel: ${input.channel}
- businessName: ${businessName}
- city: ${input.lead.city ?? "unknown"}
- category: ${input.lead.category ?? "unknown"}
- detectedProblems: ${JSON.stringify(detectedProblems)}
- demoUrl: ${demoUrl}
- agencyName: ${brandSettings.agencyName}
- salesRepName: ${brandSettings.salesRepName}
- salesRepEmail: ${brandSettings.salesRepEmail}
- salesRepPhone: ${brandSettings.salesRepPhone}
- emailSignature: ${brandSettings.emailSignature}
- legalDisclaimer: ${brandSettings.legalDisclaimer}

Required JSON:
{
  "channel": "",
  "subject": "",
  "body": "",
  "personalizationPoints": [],
  "mainSalesAngle": "",
  "cta": "",
  "riskNotes": []
}

Rules:
- Mention business name.
- Mention 1 or 2 detected problems only.
- Mention a visual demo was prepared.
- Include demo link if exists.
- CTA must be soft.
- Do not promise exaggerated results.
- Keep natural and human tone.
- whatsapp max 700 chars, instagram_dm max 500 chars.
- email can be more complete.
- call_script should be a brief call script.`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content;
    if (!raw) {
      return NextResponse.json(
        { error: "OpenAI returned empty response." },
        { status: 502 },
      );
    }

    const parsed = generateSalesMessageOutputSchema.parse(JSON.parse(raw));
    const safeMessage = applyChannelLengthRules(parsed);

    const { error } = await supabase.from("messages").insert({
      lead_id: input.lead.id,
      generated_website_id: input.generatedWebsite?.id ?? null,
      channel: safeMessage.channel,
      subject: safeMessage.subject,
      body: safeMessage.body,
      status: "draft",
    });

    if (error) {
      return NextResponse.json(
        { error: `Failed to save message: ${error.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json(safeMessage);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
