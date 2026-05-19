import { NextResponse } from "next/server";
import {
  discoverySearchInputSchema,
  searchPlacesAndPersist,
} from "@/src/lib/discovery/places";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = discoverySearchInputSchema.parse(body);
    const result = await searchPlacesAndPersist(input);
    return NextResponse.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
