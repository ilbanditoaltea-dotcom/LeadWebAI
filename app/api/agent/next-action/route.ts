import { NextResponse } from "next/server";
import { getNextActionWithAgent } from "@/src/lib/agent/client";
import { agentNextActionInputSchema } from "@/src/lib/agent/schemas";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = agentNextActionInputSchema.parse(body);
    const output = await getNextActionWithAgent(input);
    return NextResponse.json(output);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
