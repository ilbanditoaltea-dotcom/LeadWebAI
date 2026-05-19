import { z } from "zod";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import type { Json } from "@/src/lib/supabase/database.types";

export const discoverySearchInputSchema = z.object({
  query: z.string().min(2),
  city: z.string().min(2),
  category: z.string().min(2),
  limit: z.number().int().min(1).max(100).default(20),
  pageToken: z.string().optional(),
});

export const discoveryEnrichInputSchema = z.object({
  placeId: z.string().optional(),
  leadId: z.string().optional(),
});

const googlePlacePhotoSchema = z.object({
  photoReference: z.string(),
  width: z.number().nullable().default(null),
  height: z.number().nullable().default(null),
  htmlAttributions: z.array(z.string()).default([]),
});

const googleReviewSchema = z.object({
  authorName: z.string(),
  rating: z.number().nullable().default(null),
  text: z.string(),
  relativeTimeDescription: z.string().default(""),
});

export const enrichedPlaceSchema = z.object({
  placeId: z.string(),
  name: z.string(),
  category: z.string().default("unknown"),
  address: z.string().default("unknown"),
  city: z.string().default("unknown"),
  phone: z.string().default("unknown"),
  websiteUrl: z.string().default("unknown"),
  googleMapsUrl: z.string().default("unknown"),
  rating: z.number().nullable().default(null),
  reviewCount: z.number().nullable().default(null),
  openingHours: z.array(z.string()).default([]),
  photos: z.array(googlePlacePhotoSchema).default([]),
  reviews: z.array(googleReviewSchema).default([]),
  businessStatus: z.string().default("unknown"),
  types: z.array(z.string()).default([]),
});

export const discoveredPlaceSchema = z.object({
  placeId: z.string(),
  name: z.string(),
  category: z.string().default("unknown"),
  address: z.string().default("unknown"),
  city: z.string().default("unknown"),
  phone: z.string().default("unknown"),
  websiteUrl: z.string().default("unknown"),
  googleMapsUrl: z.string().default("unknown"),
  rating: z.number().nullable().default(null),
  reviewCount: z.number().nullable().default(null),
  businessStatus: z.string().default("unknown"),
  types: z.array(z.string()).default([]),
  duplicate: z.boolean().default(false),
  leadId: z.string().nullable().default(null),
});

export type DiscoverySearchInput = z.infer<typeof discoverySearchInputSchema>;
export type DiscoveryEnrichInput = z.infer<typeof discoveryEnrichInputSchema>;
export type DiscoveredPlace = z.infer<typeof discoveredPlaceSchema>;
export type EnrichedPlace = z.infer<typeof enrichedPlaceSchema>;

function getGooglePlacesApiKey() {
  return (
    process.env.GOOGLE_PLACES_API_KEY ??
    process.env.GOOGLE_MAPS_API_KEY ??
    process.env.GOOGLE_MAPS_PLACES_API_KEY
  );
}

function getSerperApiKey() {
  return process.env.SERPER_API_KEY ?? process.env.SERPAPI_API_KEY;
}

function asString(value: unknown, fallback = "unknown") {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : fallback;
}

function parseCityFromAddress(address: string) {
  const chunks = address.split(",").map((item) => item.trim()).filter(Boolean);
  if (chunks.length === 0) return "unknown";
  return chunks.length >= 2 ? chunks[chunks.length - 2] : chunks[0];
}

function normalizeWebsite(url: string) {
  if (!url || url === "unknown") return "unknown";
  const withProtocol = /^https?:\/\//i.test(url) ? url : `https://${url}`;
  try {
    const parsed = new URL(withProtocol);
    return `${parsed.protocol}//${parsed.host}${parsed.pathname}`.replace(/\/$/, "");
  } catch {
    return "unknown";
  }
}

async function searchWithGooglePlaces(input: DiscoverySearchInput) {
  const apiKey = getGooglePlacesApiKey();
  if (!apiKey) {
    return { places: [] as DiscoveredPlace[], nextPageToken: null as string | null };
  }

  const query = input.query || `${input.category} en ${input.city}`;
  const params = new URLSearchParams({
    query,
    language: "es",
    region: "es",
    key: apiKey,
  });
  if (input.pageToken) {
    params.set("pagetoken", input.pageToken);
  }

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/textsearch/json?${params.toString()}`,
    { cache: "no-store" },
  );
  if (!response.ok) {
    return { places: [] as DiscoveredPlace[], nextPageToken: null as string | null };
  }

  const json = (await response.json()) as {
    results?: Array<{
      name?: string;
      place_id?: string;
      types?: string[];
      formatted_address?: string;
      business_status?: string;
      rating?: number;
      user_ratings_total?: number;
    }>;
    next_page_token?: string;
  };

  const places = (json.results ?? [])
    .slice(0, input.limit)
    .map((result) =>
      discoveredPlaceSchema.parse({
        placeId: asString(result.place_id, ""),
        name: asString(result.name),
        category: asString(result.types?.[0], input.category),
        address: asString(result.formatted_address),
        city: parseCityFromAddress(asString(result.formatted_address)),
        phone: "unknown",
        websiteUrl: "unknown",
        googleMapsUrl: result.place_id
          ? `https://www.google.com/maps/place/?q=place_id:${result.place_id}`
          : "unknown",
        rating: typeof result.rating === "number" ? result.rating : null,
        reviewCount:
          typeof result.user_ratings_total === "number" ? result.user_ratings_total : null,
        businessStatus: asString(result.business_status),
        types: Array.isArray(result.types) ? result.types : [],
      }),
    )
    .filter((item) => item.placeId.length > 0);

  return {
    places,
    nextPageToken: json.next_page_token ?? null,
  };
}

async function searchWithSerper(input: DiscoverySearchInput) {
  const apiKey = getSerperApiKey();
  if (!apiKey) {
    return { places: [] as DiscoveredPlace[], nextPageToken: null as string | null };
  }

  const response = await fetch("https://google.serper.dev/places", {
    method: "POST",
    headers: {
      "X-API-KEY": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      q: input.query || `${input.category} en ${input.city}`,
      gl: "es",
      hl: "es",
      num: Math.min(input.limit, 20),
    }),
    cache: "no-store",
  });
  if (!response.ok) {
    return { places: [] as DiscoveredPlace[], nextPageToken: null as string | null };
  }

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

  const places = (json.places ?? []).map((result) =>
    discoveredPlaceSchema.parse({
      placeId: asString(result.cid, ""),
      name: asString(result.title),
      category: asString(result.type, input.category),
      address: asString(result.address),
      city: parseCityFromAddress(asString(result.address)),
      phone: asString(result.phoneNumber),
      websiteUrl: normalizeWebsite(asString(result.website)),
      googleMapsUrl:
        result.cid && result.cid.length > 0
          ? `https://www.google.com/maps?cid=${result.cid}`
          : "unknown",
      rating: typeof result.rating === "number" ? result.rating : null,
      reviewCount: typeof result.ratingCount === "number" ? result.ratingCount : null,
      businessStatus: "unknown",
      types: result.type ? [result.type] : [],
    }),
  );

  return {
    places: places.filter((item) => item.placeId.length > 0 || item.name !== "unknown"),
    nextPageToken: null,
  };
}

async function enrichWithGooglePlaces(placeId: string): Promise<EnrichedPlace | null> {
  const apiKey = getGooglePlacesApiKey();
  if (!apiKey) return null;

  const params = new URLSearchParams({
    place_id: placeId,
    language: "es",
    fields: [
      "place_id",
      "name",
      "formatted_address",
      "formatted_phone_number",
      "website",
      "url",
      "rating",
      "user_ratings_total",
      "opening_hours",
      "photos",
      "reviews",
      "business_status",
      "types",
    ].join(","),
    key: apiKey,
  });

  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/details/json?${params.toString()}`,
    { cache: "no-store" },
  );
  if (!response.ok) return null;

  const json = (await response.json()) as {
    result?: {
      place_id?: string;
      name?: string;
      formatted_address?: string;
      formatted_phone_number?: string;
      website?: string;
      url?: string;
      rating?: number;
      user_ratings_total?: number;
      opening_hours?: { weekday_text?: string[] };
      photos?: Array<{
        photo_reference?: string;
        width?: number;
        height?: number;
        html_attributions?: string[];
      }>;
      reviews?: Array<{
        author_name?: string;
        rating?: number;
        text?: string;
        relative_time_description?: string;
      }>;
      business_status?: string;
      types?: string[];
    };
  };

  if (!json.result?.place_id) return null;
  const result = json.result;

  return enrichedPlaceSchema.parse({
    placeId: result.place_id,
    name: asString(result.name),
    category: asString(result.types?.[0]),
    address: asString(result.formatted_address),
    city: parseCityFromAddress(asString(result.formatted_address)),
    phone: asString(result.formatted_phone_number),
    websiteUrl: normalizeWebsite(asString(result.website)),
    googleMapsUrl: asString(result.url),
    rating: typeof result.rating === "number" ? result.rating : null,
    reviewCount:
      typeof result.user_ratings_total === "number" ? result.user_ratings_total : null,
    openingHours: result.opening_hours?.weekday_text ?? [],
    photos: (result.photos ?? []).slice(0, 10).map((item) => ({
      photoReference: asString(item.photo_reference, ""),
      width: typeof item.width === "number" ? item.width : null,
      height: typeof item.height === "number" ? item.height : null,
      htmlAttributions: Array.isArray(item.html_attributions) ? item.html_attributions : [],
    })),
    reviews: (result.reviews ?? []).slice(0, 8).map((item) => ({
      authorName: asString(item.author_name),
      rating: typeof item.rating === "number" ? item.rating : null,
      text: asString(item.text, ""),
      relativeTimeDescription: asString(item.relative_time_description, ""),
    })),
    businessStatus: asString(result.business_status),
    types: result.types ?? [],
  });
}

async function enrichWithSerper(placeId: string): Promise<EnrichedPlace | null> {
  const apiKey = getSerperApiKey();
  if (!apiKey) return null;

  const response = await fetch("https://google.serper.dev/places", {
    method: "POST",
    headers: {
      "X-API-KEY": apiKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ q: placeId, gl: "es", hl: "es", num: 1 }),
    cache: "no-store",
  });
  if (!response.ok) return null;

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
      description?: string;
    }>;
  };
  const place = json.places?.[0];
  if (!place) return null;

  return enrichedPlaceSchema.parse({
    placeId: asString(place.cid, placeId),
    name: asString(place.title),
    category: asString(place.type),
    address: asString(place.address),
    city: parseCityFromAddress(asString(place.address)),
    phone: asString(place.phoneNumber),
    websiteUrl: normalizeWebsite(asString(place.website)),
    googleMapsUrl:
      place.cid && place.cid.length > 0 ? `https://www.google.com/maps?cid=${place.cid}` : "unknown",
    rating: typeof place.rating === "number" ? place.rating : null,
    reviewCount: typeof place.ratingCount === "number" ? place.ratingCount : null,
    openingHours: [],
    photos: [],
    reviews: place.description
      ? [
          {
            authorName: "Google",
            rating: typeof place.rating === "number" ? place.rating : null,
            text: place.description,
            relativeTimeDescription: "",
          },
        ]
      : [],
    businessStatus: "unknown",
    types: place.type ? [place.type] : [],
  });
}

function toLeadInsert(place: DiscoveredPlace) {
  return {
    business_name: place.name,
    category: place.category,
    city: place.city,
    description: `Lead descubierto via search-places. place_id=${place.placeId}`,
    address: place.address,
    phone: place.phone,
    website_url: place.websiteUrl,
    google_maps_url: place.googleMapsUrl,
    rating: place.rating,
    review_count: place.reviewCount,
    status: "new",
  };
}

export async function searchPlacesAndPersist(input: DiscoverySearchInput) {
  const supabase = await createSupabaseServerClient();
  const google = await searchWithGooglePlaces(input);
  const fallback =
    google.places.length > 0 ? google : await searchWithSerper(input);

  const dedupedByPlace = Array.from(
    new Map(
      fallback.places.map((place) => [place.placeId || `${place.name}|${place.address}`, place]),
    ).values(),
  ).slice(0, input.limit);

  const existingLeads =
    dedupedByPlace.length > 0
      ? await supabase
          .from("leads")
          .select("id, business_name, google_maps_url, description")
          .in(
            "business_name",
            dedupedByPlace.map((item) => item.name),
          )
      : { data: [] as Array<{ id: string; business_name: string; google_maps_url: string | null; description: string | null }> };

  const existingByName = new Map(
    (existingLeads.data ?? []).map((lead) => [
      lead.business_name.toLowerCase().trim(),
      lead.id,
    ]),
  );

  let createdCount = 0;
  let duplicatesCount = 0;
  const places: DiscoveredPlace[] = [];

  for (const place of dedupedByPlace) {
    const existingLeadId = existingByName.get(place.name.toLowerCase().trim()) ?? null;
    if (existingLeadId) {
      duplicatesCount += 1;
      places.push({ ...place, duplicate: true, leadId: existingLeadId });
      continue;
    }

    const { data: inserted } = await supabase
      .from("leads")
      .insert(toLeadInsert(place))
      .select("id")
      .maybeSingle();

    createdCount += inserted?.id ? 1 : 0;
    places.push({
      ...place,
      duplicate: false,
      leadId: inserted?.id ?? null,
    });
  }

  return {
    provider: google.places.length > 0 ? "google_places" : "serper_fallback",
    requestedLimit: input.limit,
    foundCount: places.length,
    createdCount,
    duplicatesCount,
    nextPageToken: fallback.nextPageToken,
    places,
  };
}

export async function enrichPlace(input: DiscoveryEnrichInput) {
  const supabase = await createSupabaseServerClient();
  const parsed = discoveryEnrichInputSchema.parse(input);

  let placeId = parsed.placeId ?? "";
  let leadId: string | null = parsed.leadId ?? null;

  if (!placeId && parsed.leadId) {
    const { data: lead } = await supabase
      .from("leads")
      .select("id, business_name, description")
      .eq("id", parsed.leadId)
      .maybeSingle();
    if (!lead) {
      throw new Error("Lead no encontrado para enriquecer.");
    }
    leadId = lead.id;
    const match = (lead.description ?? "").match(/place_id=([^\s]+)/i);
    placeId = match?.[1] ?? "";
  }

  if (!placeId) {
    throw new Error("Debes enviar placeId o leadId con place_id guardado.");
  }

  const google = await enrichWithGooglePlaces(placeId);
  const enriched = google ?? (await enrichWithSerper(placeId));
  if (!enriched) {
    throw new Error("No se pudo enriquecer el negocio con Google Places ni fallback.");
  }

  const { data: maybeLead } =
    leadId
      ? await supabase.from("leads").select("id").eq("id", leadId).maybeSingle()
      : await supabase
          .from("leads")
          .select("id")
          .eq("business_name", enriched.name)
          .maybeSingle();

  const resolvedLeadId = maybeLead?.id ?? leadId;
  if (resolvedLeadId) {
    await supabase
      .from("leads")
      .update({
        category: enriched.category,
        city: enriched.city,
        address: enriched.address,
        phone: enriched.phone,
        website_url: enriched.websiteUrl,
        google_maps_url: enriched.googleMapsUrl,
        rating: enriched.rating,
        review_count: enriched.reviewCount,
        description: `Lead enriquecido. place_id=${enriched.placeId}`,
      })
      .eq("id", resolvedLeadId);

    await supabase.from("activities").insert({
      lead_id: resolvedLeadId,
      type: "discovery_enrich_place",
      description: "Negocio enriquecido con datos de Maps/Places.",
      metadata: enriched as unknown as Json,
    });
  }

  return {
    leadId: resolvedLeadId ?? null,
    enriched,
  };
}
