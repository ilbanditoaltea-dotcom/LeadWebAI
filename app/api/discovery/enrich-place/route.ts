import { NextResponse } from "next/server";
import { z } from "zod";
import { enrichPlaceById } from "@/src/lib/discovery/discovery-service";

const inputSchema = z.object({
  placeId: z.string().min(1),
  leadId: z.string().uuid().optional(),
});

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = inputSchema.parse(body);
    const result = await enrichPlaceById(input);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
