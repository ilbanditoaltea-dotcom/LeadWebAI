import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { updateSupabaseSession } from "@/src/lib/supabase/proxy";
import { INTERNAL_AUTH_COOKIE, isInternalAuthEnabled } from "@/src/lib/auth/internal";

function isPublicPath(pathname: string) {
  return (
    pathname === "/login" ||
    pathname.startsWith("/demo/") ||
    pathname.startsWith("/api/auth/")
  );
}

export async function proxy(request: NextRequest) {
  if (!isInternalAuthEnabled()) {
    return updateSupabaseSession(request);
  }

  const pathname = request.nextUrl.pathname;
  const authCookie = request.cookies.get(INTERNAL_AUTH_COOKIE)?.value;
  const authenticated = authCookie === "ok";

  if (!authenticated && !isPublicPath(pathname) && !pathname.startsWith("/api/")) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (authenticated && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    return NextResponse.redirect(url);
  }

  return updateSupabaseSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
