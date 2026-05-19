import { NextResponse } from "next/server";
import { INTERNAL_AUTH_COOKIE } from "@/src/lib/auth/internal";

export async function POST() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set(INTERNAL_AUTH_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 0,
  });
  return response;
}
