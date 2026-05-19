import { cookies } from "next/headers";

export const INTERNAL_AUTH_COOKIE = "leadweb_internal_auth";

function normalize(value: string | undefined) {
  return (value ?? "").trim();
}

export function isInternalAuthEnabled() {
  return normalize(process.env.INTERNAL_APP_PASSWORD).length > 0;
}

export function isInternalPasswordValid(password: string) {
  const expected = normalize(process.env.INTERNAL_APP_PASSWORD);
  if (!expected) {
    return false;
  }
  return normalize(password) === expected;
}

export async function isInternalSessionAuthenticated() {
  const store = await cookies();
  return store.get(INTERNAL_AUTH_COOKIE)?.value === "ok";
}
