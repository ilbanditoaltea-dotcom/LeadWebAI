import { NextResponse } from "next/server";
import { z } from "zod";
import { hasValidSupabaseEnv } from "@/src/lib/supabase/env";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";

const clearSchema = z.object({
  confirmText: z.string(),
});

const REQUIRED_CONFIRM_TEXT = "BORRAR PRUEBAS";

export async function POST(request: Request) {
  try {
    if (!hasValidSupabaseEnv()) {
      return NextResponse.json(
        { error: "Supabase no está configurado para limpiar datos." },
        { status: 400 },
      );
    }

    const body = await request.json();
    const input = clearSchema.parse(body);
    if (input.confirmText.trim().toUpperCase() !== REQUIRED_CONFIRM_TEXT) {
      return NextResponse.json(
        { error: `Confirmación inválida. Escribe exactamente: ${REQUIRED_CONFIRM_TEXT}` },
        { status: 400 },
      );
    }

    const supabase = await createSupabaseServerClient();
    const errors: string[] = [];

    const operations = [
      { table: "generated_website_versions", key: "id" },
      { table: "activities", key: "id" },
      { table: "messages", key: "id" },
      { table: "generated_websites", key: "id" },
      { table: "leads", key: "id" },
      { table: "campaigns", key: "id" },
    ] as const;

    for (const operation of operations) {
      const { error } = await supabase
        .from(operation.table)
        .delete()
        .not(operation.key, "is", null);
      if (error) {
        errors.push(`${operation.table}: ${error.message}`);
      }
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: `No se pudo completar la limpieza: ${errors.join(" | ")}` },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
