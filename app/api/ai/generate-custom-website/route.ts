import OpenAI from "openai";
import { NextResponse } from "next/server";
import {
  generateCustomWebsiteInputSchema,
  generateCustomWebsiteOutputSchema,
} from "@/src/lib/ai/generate-custom-website";
import { extractWebsiteIntelligence } from "@/src/lib/ai/website-intelligence";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import type { Json } from "@/src/lib/supabase/database.types";

function slugify(input: string) {
  return input
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

async function buildUniqueDemoSlug(baseName: string) {
  const supabase = await createSupabaseServerClient();
  const baseSlug = slugify(baseName) || "demo";

  const { data } = await supabase
    .from("generated_websites")
    .select("demo_slug")
    .ilike("demo_slug", `${baseSlug}%`);

  if (!data || data.length === 0) {
    return baseSlug;
  }

  const suffix = data.length + 1;
  return `${baseSlug}-${suffix}`;
}

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
    const input = generateCustomWebsiteInputSchema.parse(body);
    const websiteIntel = await extractWebsiteIntelligence({
      websiteUrl: input.websiteUrl,
      businessName: input.businessName,
      category: input.category,
      city: input.city,
      fallbackText: `${input.description}\n${input.recommendations.join("\n")}`,
    });

    const openai = new OpenAI({ apiKey: openAiApiKey });

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are an elite conversion-focused web strategist for local businesses. Return ONLY valid JSON, no markdown. Never return code or HTML. If information is missing, use 'unknown' or elegant generic copy without fabricating concrete facts.",
        },
        {
          role: "user",
          content: `Generate a custom website blueprint in JSON.

Input:
- leadId: ${input.leadId}
- businessName: ${input.businessName}
- category: ${input.category}
- city: ${input.city}
- description: ${input.description}
- phone: ${input.phone}
- email: ${input.email}
- whatsapp: ${input.whatsapp}
- address: ${input.address}
- websiteUrl: ${input.websiteUrl}
- detectedProblems: ${JSON.stringify(input.detectedProblems)}
- recommendations: ${JSON.stringify(input.recommendations)}
- targetGoal: ${input.targetGoal}
- websiteIntel: ${JSON.stringify(websiteIntel)}

Required output schema:
{
  "businessProfile": {
    "businessName": "",
    "businessType": "restaurant | bar | clinic | beauty | barbershop | real_estate | shop | academy | fitness | hotel | automotive | generic",
    "city": "",
    "category": "",
    "targetCustomer": "",
    "mainGoal": "get_reservations | get_appointments | get_calls | get_whatsapp_messages | sell_products | capture_leads | show_catalog | build_trust | promote_services",
    "tone": "",
    "visualStyle": "premium_dark | clean_medical | warm_restaurant | modern_minimal | luxury | playful | industrial | natural | corporate | mediterranean | vintage | urban",
    "colorPalette": {
      "primary": "",
      "secondary": "",
      "background": "",
      "text": "",
      "accent": ""
    },
    "fontStyle": "",
    "imageStyle": ""
  },
  "website": {
    "hero": {
      "variant": "",
      "eyebrow": "",
      "title": "",
      "subtitle": "",
      "primaryCTA": "",
      "secondaryCTA": "",
      "backgroundImagePrompt": ""
    },
    "sections": [
      {
        "type": "services | menu | booking | contact | reviews | gallery | faq | catalog | properties | before_after | team | location | pricing | offers | process | trust_badges | final_cta | instagram | opening_hours | story | featured_products | lead_capture_form",
        "variant": "",
        "title": "",
        "subtitle": "",
        "imagePrompt": "",
        "imageAlt": "",
        "items": [],
        "cta": "",
        "order": 1
      }
    ]
  },
  "seo": {
    "title": "",
    "description": "",
    "keywords": []
  },
  "contact": {
    "phone": "",
    "email": "",
    "whatsapp": "",
    "address": ""
  },
  "confidence": {
    "reasoning": "",
    "salesAngle": "",
    "detectedProblems": [],
    "recommendedFeatures": []
  }
}

Rules:
- No fixed templates.
- Decide sections dynamically by business.
- Decide section order.
- Choose tone, visual style, and color palette grounded in websiteIntel when available.
- Generate real commercial copy, specific to this business.
- Do not generate React, code, or HTML.
- Only JSON.
- If phone/email/whatsapp/address is unknown, keep "unknown" and do not fabricate.
- Optimize for the targetGoal.
- Minimum 6 and maximum 10 sections.
- Always include hero and final_cta.
- Each section must include imagePrompt and imageAlt.
- Generate high quality visual prompts for:
  - hero (via backgroundImagePrompt)
  - gallery
  - featured_products
  - before_after
  - properties
  - menu
- Restaurants: prioritize menu, booking, gallery, reviews, location.
- Clinics: prioritize services, team, trust_badges, booking, reviews, faq.
- Barbershop/beauty: prioritize services, pricing, before_after, booking, gallery.
- Real estate: prioritize properties, lead_capture_form, services, reviews, faq.
- Shops: prioritize catalog, featured_products, contact, reviews.
- Academy: prioritize services, process, pricing, faq, lead_capture_form.`,
        },
      ],
    });

    const rawContent = completion.choices[0]?.message?.content;
    if (!rawContent) {
      return NextResponse.json(
        { error: "OpenAI returned empty content." },
        { status: 502 },
      );
    }

    const generated = generateCustomWebsiteOutputSchema.parse(
      JSON.parse(rawContent),
    );

    const supabase = await createSupabaseServerClient();
    const demoSlug = await buildUniqueDemoSlug(generated.businessProfile.businessName);
    const websiteJson = generated.website as unknown as Json;
    const seoJson = generated.seo as unknown as Json;
    const contactJson = generated.contact as unknown as Json;
    const confidenceJson = generated.confidence as unknown as Json;

    const { data: insertedWebsite, error: insertError } = await supabase
      .from("generated_websites")
      .insert({
        lead_id: input.leadId,
        business_profile: generated.businessProfile,
        website: websiteJson,
        seo: seoJson,
        contact: contactJson,
        confidence: confidenceJson,
        demo_slug: demoSlug,
        status: "draft",
      })
      .select("id, demo_slug")
      .maybeSingle();

    if (insertError || !insertedWebsite) {
      return NextResponse.json(
        { error: `Failed to save generated website: ${insertError?.message ?? "Unknown insert error"}` },
        { status: 500 },
      );
    }

    const { error: updateLeadError } = await supabase
      .from("leads")
      .update({ status: "website_generated" })
      .eq("id", input.leadId);

    if (updateLeadError) {
      return NextResponse.json(
        { error: `Failed to update lead status: ${updateLeadError.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ...generated,
      generatedWebsiteId: insertedWebsite.id,
      demoSlug: insertedWebsite.demo_slug,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
