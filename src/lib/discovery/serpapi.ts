import { z } from "zod";

export const serpPlaceSchema = z.object({
  placeId: z.string(),
  name: z.string(),
  category: z.string(),
  address: z.string().nullable(),
  city: z.string().nullable(),
  phone: z.string().nullable(),
  websiteUrl: z.string().nullable(),
  googleMapsUrl: z.string().nullable(),
  rating: z.number().nullable(),
  reviewCount: z.number().nullable(),
  types: z.array(z.string()),
});

function parseCity(address: string | null) {
  if (!address) return null;
  const chunks = address.split(",").map((chunk) => chunk.trim()).filter(Boolean);
  if (chunks.length < 2) return chunks[0] ?? null;
  return chunks[chunks.length - 2] ?? null;
}

function asUrl(input: string | null) {
  if (!input || input === "unknown") return null;
  const value = /^https?:\/\//i.test(input) ? input : `https://${input}`;
  try {
    const parsed = new URL(value);
    return `${parsed.protocol}//${parsed.host}${parsed.pathname}`.replace(/\/$/, "");
  } catch {
    return null;
  }
}

export async function searchSerpPlaces(input: {
  query: string;
  city: string;
  category: string;
  limit: number;
}) {
  const key = process.env.SERPAPI_API_KEY ?? process.env.SERPER_API_KEY;
  if (!key) return { places: [] };

  const response = await fetch("https://google.serper.dev/places", {
    method: "POST",
    headers: {
      "X-API-KEY": key,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      q: `${input.query} ${input.city} ${input.category}`.trim(),
      gl: "es",
      hl: "es",
      num: Math.min(input.limit, 20),
    }),
    cache: "no-store",
  });
  if (!response.ok) return { places: [] };

  const json = (await response.json()) as {
    places?: Array<{
      title?: string;
      cid?: string;
      address?: string;
      phoneNumber?: string;
      website?: string;
      rating?: number;
      ratingCount?: number;
      type?: string;
    }>;
  };

  const places = (json.places ?? [])
    .flatMap((item) => {
      const placeId = item.cid ?? "";
      if (!placeId) return [];
      return [
        serpPlaceSchema.parse({
          placeId,
          name: item.title ?? "unknown",
          category: item.type ?? input.category,
          address: item.address ?? null,
          city: parseCity(item.address ?? null),
          phone: item.phoneNumber ?? null,
          websiteUrl: asUrl(item.website ?? null),
          googleMapsUrl: item.cid ? `https://www.google.com/maps?cid=${item.cid}` : null,
          rating: typeof item.rating === "number" ? item.rating : null,
          reviewCount: typeof item.ratingCount === "number" ? item.ratingCount : null,
          types: item.type ? [item.type] : [],
        }),
      ];
    })
    .slice(0, input.limit);

  return { places };
}
