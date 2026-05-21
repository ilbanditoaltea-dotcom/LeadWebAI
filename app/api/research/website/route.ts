import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import { researchWebsite } from "@/src/lib/research/website-research-service";

const inputSchema = z.object({
  leadId: z.string().uuid(),
});

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = inputSchema.parse(body);
    const supabase = await createSupabaseServerClient();
    const { data: lead } = await supabase
      .from("leads")
      .select("website_url")
      .eq("id", input.leadId)
      .maybeSingle();
    if (!lead?.website_url || lead.website_url === "unknown") {
      return NextResponse.json({ error: "Lead no tiene website_url válida." }, { status: 400 });
    }
    const result = await researchWebsite({
      leadId: input.leadId,
      websiteUrl: lead.website_url,
    });
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
