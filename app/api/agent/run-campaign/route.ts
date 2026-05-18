import { NextResponse } from "next/server";
import {
  runAutopilotCampaign,
  runCampaignInputSchema,
} from "@/src/lib/agent/run-campaign";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = runCampaignInputSchema.parse(body);
    const output = await runAutopilotCampaign(input);
    return NextResponse.json(output);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
