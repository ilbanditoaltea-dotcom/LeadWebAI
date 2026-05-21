import { NextResponse } from "next/server";
import { fullPipelineInputSchema } from "@/src/lib/lead-intelligence/schemas";
import { runFullPipeline } from "@/src/lib/lead-intelligence/full-pipeline";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = fullPipelineInputSchema.parse(body);
    const result = await runFullPipeline(input);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
