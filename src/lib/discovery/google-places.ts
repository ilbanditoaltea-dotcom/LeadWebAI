import { z } from "zod";

export const googlePlaceResultSchema = z.object({
  placeId: z.string(),
  name: z.string(),
  category: z.string(),
  address: z.string().nullable(),
  city: z.string().nullable(),
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

export async function searchGooglePlaces(input: {
  query: string;
  city: string;
  category: string;
  limit: number;
}) {
  const key =
    process.env.GOOGLE_PLACES_API_KEY ??
    process.env.GOOGLE_MAPS_API_KEY ??
    process.env.GOOGLE_MAPS_PLACES_API_KEY;
  if (!key) return { places: [], nextPageToken: null as string | null };

  const params = new URLSearchParams({
    query: `${input.query} ${input.city} ${input.category}`.trim(),
    language: "es",
    region: "es",
    key,
  });
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/textsearch/json?${params.toString()}`,
    { cache: "no-store" },
  );
  if (!response.ok) return { places: [], nextPageToken: null as string | null };
  const json = (await response.json()) as {
    results?: Array<{
      place_id?: string;
      name?: string;
      formatted_address?: string;
      types?: string[];
      rating?: number;
      user_ratings_total?: number;
    }>;
    next_page_token?: string;
  };

  const places = (json.results ?? [])
    .slice(0, input.limit)
    .flatMap((item) => {
      const placeId = item.place_id ?? "";
      if (!placeId) return [];
      const address = item.formatted_address ?? null;
      return [
        googlePlaceResultSchema.parse({
          placeId,
          name: item.name ?? "unknown",
          category: item.types?.[0] ?? input.category,
          address,
          city: parseCity(address),
          googleMapsUrl: `https://www.google.com/maps/place/?q=place_id:${placeId}`,
          rating: typeof item.rating === "number" ? item.rating : null,
          reviewCount:
            typeof item.user_ratings_total === "number" ? item.user_ratings_total : null,
          types: item.types ?? [],
        }),
      ];
    });

  return {
    places,
    nextPageToken: json.next_page_token ?? null,
  };
}
