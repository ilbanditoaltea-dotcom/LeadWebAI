export function looksTechnicalDump(value: string) {
  if (!value) return false;
  const candidate = value.toLowerCase().trim();
  if (!candidate) return false;

  if (
    candidate.length > 350 &&
    (candidate.includes("{") || candidate.includes("[") || candidate.includes('":'))
  ) {
    return true;
  }

  return (
    candidate.includes("window.") ||
    candidate.includes("langshopconfig") ||
    candidate.includes("shopifylocales") ||
    candidate.includes("targetlanguages") ||
    candidate.includes("languagesswitcher") ||
    candidate.includes("shopify") ||
    candidate.includes("javascript") ||
    candidate.includes("function(") ||
    candidate.includes("=>") ||
    candidate.includes('"code"') ||
    candidate.includes('"locale"') ||
    candidate.includes('"dimension"') ||
    candidate.includes('"position"') ||
    candidate.includes('"published"') ||
    candidate.includes('"currency"') ||
    candidate.includes('"country"') ||
    /"[a-z0-9_]+"\s*:\s*[\[{"'\d]/.test(candidate) ||
    /\{[\s\S]{60,}\}/.test(value) ||
    /\[[\s\S]{60,}\]/.test(value)
  );
}

export function stripTechnicalNoise(value: string) {
  return value
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/window\.[a-zA-Z0-9_$.]+\s*=\s*\{[\s\S]*?\};?/g, " ")
    .replace(/\{[\s\S]{80,}\}/g, " ")
    .replace(/\[[\s\S]{80,}\]/g, " ")
    .replace(/"code"\s*:\s*"[^"]+"/gi, " ")
    .replace(/"name"\s*:\s*"[^"]+"/gi, " ")
    .replace(/"locale"\s*:\s*"[^"]+"/gi, " ")
    .replace(/\b(langshopconfig|shopifylocales|targetlanguages|languagesSwitcher)\b/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function cleanMarketingText(value: string, fallback: string, maxLen = 180) {
  const stripped = stripTechnicalNoise(value ?? "");
  const trimmed = stripped.replace(/\s+/g, " ").trim();
  if (!trimmed || looksTechnicalDump(trimmed)) return fallback;
  return trimmed.slice(0, maxLen);
}
