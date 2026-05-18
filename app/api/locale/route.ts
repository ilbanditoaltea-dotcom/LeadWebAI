import { NextResponse } from "next/server";
import { normalizeLocale } from "@/app/lib/i18n";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { locale?: string };
    const locale = normalizeLocale(body.locale);

    const response = NextResponse.json({ ok: true, locale });
    response.cookies.set("locale", locale, {
      path: "/",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 365,
    });
    return response;
  } catch {
    return NextResponse.json({ error: "Invalid locale payload." }, { status: 400 });
  }
}
