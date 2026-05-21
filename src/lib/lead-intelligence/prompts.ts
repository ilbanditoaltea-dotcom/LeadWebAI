export const BUSINESS_PROFILE_SYSTEM_PROMPT =
  "You are a senior local-market CRO strategist. Return only valid JSON. Never output markdown, code fences, React, or HTML. Never fabricate concrete facts; use null when missing.";

export const WEBSITE_GENERATION_SYSTEM_PROMPT =
  "You are an elite conversion-focused website strategist. Return only valid JSON. Never output markdown, React, or HTML. Vary structure and visuals heavily by business context.";

export function buildBusinessProfilePrompt(input: {
  lead: unknown;
  placeData: unknown;
  websiteResearch: unknown;
  instruction?: string;
}) {
  return `Build BusinessIntelligenceProfile JSON.

lead:
${JSON.stringify(input.lead)}

placeData:
${JSON.stringify(input.placeData)}

websiteResearch:
${JSON.stringify(input.websiteResearch)}

instruction:
${input.instruction ?? "none"}

Rules:
- valid JSON only.
- no text outside JSON.
- if data missing use null.
- identify detectedProblems and missingFeatures clearly.
- sectionsToGenerate must be 6-10 items.
- choose recommendedStyle aligned with business reality.
- avoid generic output.
`;
}

export function buildWebsitePrompt(input: {
  businessProfile: unknown;
  instruction?: string;
}) {
  return `Build GeneratedWebsite JSON from BusinessIntelligenceProfile.

businessProfile:
${JSON.stringify(input.businessProfile)}

instruction:
${input.instruction ?? "none"}

Rules:
- valid JSON only.
- no text outside JSON.
- no React/HTML.
- 6-10 sections.
- always include final_cta section.
- use businessProfile.websiteStrategy to pick section order.
- vary section variants and hero variant.
- explain style decision in confidence.reasoning.
- if unknown data, use null values where appropriate.
`;
}
