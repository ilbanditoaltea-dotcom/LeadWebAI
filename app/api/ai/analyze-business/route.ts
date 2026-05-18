import OpenAI from "openai";
import { NextResponse } from "next/server";
import {
  analyzeBusinessInputSchema,
  analyzeBusinessOutputSchema,
} from "@/src/lib/ai/analyze-business";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";

export async function POST(request: Request) {
  const openAiApiKey = process.env.OPENAI_API_KEY;

  if (!openAiApiKey) {
    return NextResponse.json(
      { error: "OPENAI_API_KEY is missing in environment variables." },
      { status: 500 },
    );
  }

  try {
    const json = await request.json();
    const input = analyzeBusinessInputSchema.parse(json);

    const openai = new OpenAI({ apiKey: openAiApiKey });

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      temperature: 0.2,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a senior digital marketing consultant for local businesses. Return only valid JSON. Be concrete, practical, and sales-oriented around monthly recurring services. Never invent unavailable facts. If unknown, explicitly use 'unknown'.",
        },
        {
          role: "user",
          content: `Analyze this local business and return JSON only.

Input:
- leadId: ${input.leadId}
- businessName: ${input.businessName}
- category: ${input.category}
- city: ${input.city}
- description: ${input.description}
- websiteUrl: ${input.websiteUrl}
- googleMapsUrl: ${input.googleMapsUrl}
- instagramUrl: ${input.instagramUrl}

Required JSON structure:
{
  "businessType": "restaurant | bar | clinic | beauty | barbershop | real_estate | shop | academy | fitness | hotel | automotive | generic",
  "opportunityScore": 0,
  "websiteQualityScore": 0,
  "targetCustomer": "",
  "mainGoal": "get_reservations | get_appointments | get_calls | get_whatsapp_messages | sell_products | capture_leads | show_catalog | build_trust | promote_services",
  "detectedProblems": [],
  "recommendations": [],
  "salesAngle": "",
  "suggestedMonthlyPlan": {
    "name": "",
    "price": "",
    "reason": "",
    "features": []
  }
}

Rules:
- Do not fabricate data.
- If unknown, use "unknown".
- Be concrete and short.
- recommendations and plan must focus on recurring monthly services:
  website improvements, reservations, online menu, WhatsApp, catalog, local SEO, maintenance, automations.
- opportunityScore and websiteQualityScore must be integers from 0 to 100.`,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "OpenAI returned an empty response." },
        { status: 502 },
      );
    }

    const parsedOutput = analyzeBusinessOutputSchema.parse(JSON.parse(content));

    const supabase = await createSupabaseServerClient();
    const { error: updateError } = await supabase
      .from("leads")
      .update({
        opportunity_score: parsedOutput.opportunityScore,
        website_quality_score: parsedOutput.websiteQualityScore,
        detected_problems: parsedOutput.detectedProblems,
        recommendations: parsedOutput.recommendations,
        main_problem_detected: parsedOutput.detectedProblems[0] ?? "unknown",
        status: "analyzed",
      })
      .eq("id", input.leadId);

    if (updateError) {
      return NextResponse.json(
        { error: `Supabase update failed: ${updateError.message}` },
        { status: 500 },
      );
    }

    return NextResponse.json(parsedOutput);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
