import { NextResponse } from "next/server";
import { z } from "zod";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";

const updateLeadStatusSchema = z.object({
  leadId: z.string().min(1),
  status: z.enum([
    "new_lead",
    "analyzed",
    "website_generated",
    "pending_approval",
    "approved",
    "contacted",
    "responded",
    "client",
  ]),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = updateLeadStatusSchema.parse(body);

    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from("leads")
      .update({ status: payload.status })
      .eq("id", payload.leadId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
