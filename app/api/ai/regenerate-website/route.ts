import { NextResponse } from "next/server";
import { agentRegenerateWebsiteInputSchema } from "@/src/lib/agent/schemas";
import { regenerateWebsiteWithAgent } from "@/src/lib/agent/client";
import { updateGeneratedWebsite } from "@/src/lib/tools/lead-tools";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = agentRegenerateWebsiteInputSchema.parse(body);
    const output = await regenerateWebsiteWithAgent(input);
    await updateGeneratedWebsite(input.generatedWebsiteId, output);
    return NextResponse.json(output);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
