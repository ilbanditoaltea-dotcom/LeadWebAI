import { NextResponse } from "next/server";
import { z } from "zod";
import { createBusinessProfileFromLead } from "@/src/lib/lead-intelligence/business-profile";

const inputSchema = z.object({
  leadId: z.string().uuid(),
  instruction: z.string().optional(),
});

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = inputSchema.parse(body);
    const result = await createBusinessProfileFromLead(input);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
