import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";

const saveMessageSchema = z.object({
  leadId: z.string().min(1),
  generatedWebsiteId: z.string().nullable().optional(),
  channel: z.enum(["email", "whatsapp", "instagram_dm", "call_script"]),
  subject: z.string().optional().default(""),
  body: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = saveMessageSchema.parse(body);

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.from("messages").insert({
      lead_id: payload.leadId,
      generated_website_id: payload.generatedWebsiteId ?? null,
      channel: payload.channel,
      subject: payload.subject,
      body: payload.body,
      status: "draft",
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
