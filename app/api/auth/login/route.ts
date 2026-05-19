import { NextResponse } from "next/server";
import { z } from "zod";
import {
  INTERNAL_AUTH_COOKIE,
  isInternalAuthEnabled,
  isInternalPasswordValid,
} from "@/src/lib/auth/internal";

const loginSchema = z.object({
  password: z.string().min(1),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const input = loginSchema.parse(body);

    if (!isInternalAuthEnabled()) {
      return NextResponse.json(
        { error: "INTERNAL_APP_PASSWORD no está configurada en el servidor." },
        { status: 400 },
      );
    }

    if (!isInternalPasswordValid(input.password)) {
      return NextResponse.json({ error: "Contraseña inválida." }, { status: 401 });
    }

    const response = NextResponse.json({ ok: true });
    response.cookies.set(INTERNAL_AUTH_COOKIE, "ok", {
      httpOnly: true,
      sameSite: "lax",
      secure: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
