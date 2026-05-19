import OpenAI from "openai";
import { NextResponse } from "next/server";
import {
  generateCustomWebsiteFromBipInputSchema,
  generateCustomWebsiteInputSchema,
  generateCustomWebsiteOutputSchema,
} from "@/src/lib/ai/generate-custom-website";
import { extractWebsiteIntelligence } from "@/src/lib/ai/website-intelligence";
import { buildBusinessIntelligenceProfile } from "@/src/lib/research/business-profile";
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
    const bipInput = generateCustomWebsiteFromBipInputSchema.safeParse(body);
    const legacyInput = bipInput.success ? null : generateCustomWebsiteInputSchema.parse(body);
    const input = bipInput.success ? bipInput.data : legacyInput;
    const leadId = bipInput.success ? bipInput.data.leadId : legacyInput!.leadId;
    const intelligenceProfile = bipInput.success
      ? bipInput.data.businessProfile
      : await buildBusinessIntelligenceProfile({
          lead: {
            id: legacyInput!.leadId,
            businessName: legacyInput!.businessName,
            category: legacyInput!.category,
            city: legacyInput!.city,
            description: legacyInput!.description,
            websiteUrl: legacyInput!.websiteUrl,
            phone: legacyInput!.phone,
            address: legacyInput!.address,
            googleMapsUrl: "unknown",
            detectedProblems: legacyInput!.detectedProblems,
            recommendations: legacyInput!.recommendations,
          },
          websiteCrawlSummary: legacyInput!.description,
        });
    const websiteIntel = await extractWebsiteIntelligence({
      websiteUrl: intelligenceProfile.identity.websiteUrl,
      businessName: intelligenceProfile.identity.businessName,
      category: intelligenceProfile.identity.category,
      city: intelligenceProfile.identity.city,
      fallbackText: [
        intelligenceProfile.currentDigitalPresence.websiteSummary,
        ...intelligenceProfile.currentDigitalPresence.detectedProblems,
        ...intelligenceProfile.currentDigitalPresence.missingFeatures,
      ].join("\n"),
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

Lead context:
- leadId: ${leadId}
- businessIntelligenceProfile: ${JSON.stringify(intelligenceProfile)}
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
    "visualStyle": "warm_restaurant | rustic_mediterranean | premium_dark | modern_minimal | clean_medical | vintage_barbershop | luxury_real_estate | playful_academy | natural_wellness | urban_fitness | industrial_automotive | boutique_hotel",
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
- Choose tone, visual style, and color palette grounded in businessIntelligenceProfile and websiteIntel.
- Generate real commercial copy, specific to this business.
- Do not generate React, code, or HTML.
- Only JSON.
- If phone/email/whatsapp/address is unknown, keep "unknown" and do not fabricate.
- Optimize for salesStrategy.mainGoal and websiteStrategy.ctaStrategy.
- Minimum 6 and maximum 10 sections.
- Always include hero and final_cta.
- Each section must include imagePrompt and imageAlt.
- If section type is unusual, still output it as a string and keep semantic naming.
- Hero variants allowed:
  split_image, centered_editorial, dark_overlay, card_hero, minimal_clean, magazine_style, local_business
- Services variants allowed:
  icon_cards, horizontal_rows, editorial_list, pricing_cards, feature_grid
- Gallery variants allowed:
  masonry, three_cards, wide_banner, before_after_grid
- Reviews variants allowed:
  testimonial_cards, quote_wall, rating_summary
- Contact variants allowed:
  map_card, split_contact, sticky_cta
- Menu variants allowed:
  menu_cards, elegant_menu_list, highlighted_specials
- Booking variants allowed:
  compact_form, whatsapp_first, calendar_style_mock
- confidence.reasoning must include WHY visual style was selected for this business.
- Never use clean_medical when business looks rustic/traditional.
- Premium businesses should use spacious, darker or elegant styling.
- Family/casual businesses should use warmer and more accessible color/tone.
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
    const styleReason = `Style selected: ${generated.businessProfile.visualStyle}.`;
    if (!generated.confidence.reasoning.toLowerCase().includes("style")) {
      generated.confidence.reasoning = `${generated.confidence.reasoning} ${styleReason}`.trim();
    }

    const supabase = await createSupabaseServerClient();
    const demoSlug = await buildUniqueDemoSlug(generated.businessProfile.businessName);
    const websiteJson = generated.website as unknown as Json;
    const seoJson = generated.seo as unknown as Json;
    const contactJson = generated.contact as unknown as Json;
    const confidenceJson = generated.confidence as unknown as Json;

    const { data: insertedWebsite, error: insertError } = await supabase
      .from("generated_websites")
      .insert({
        lead_id: leadId,
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
      .eq("id", leadId);

    if (updateLeadError) {
      return NextResponse.json(
        { error: `Failed to update lead status: ${updateLeadError.message}` },
        { status: 500 },
      );
    }

    await supabase.from("activities").insert({
      lead_id: leadId,
      type: "generate_custom_website_from_bip",
      description: "Generated website creado desde BusinessIntelligenceProfile.",
      metadata: intelligenceProfile as unknown as Json,
    });

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
