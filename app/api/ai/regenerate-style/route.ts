import { NextResponse } from "next/server";
import {
  regenerateWebsiteInputSchema,
  regenerateWebsitePartial,
} from "@/src/lib/ai/regenerate-website";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = regenerateWebsiteInputSchema.parse(body);
    const output = await regenerateWebsitePartial("style", input);
    return NextResponse.json(output);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
