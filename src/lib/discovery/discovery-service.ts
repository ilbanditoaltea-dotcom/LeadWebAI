import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import type { Json } from "@/src/lib/supabase/database.types";
import { searchGooglePlaces } from "@/src/lib/discovery/google-places";
import { searchSerpPlaces } from "@/src/lib/discovery/serpapi";
import { enrichPlace } from "@/src/lib/discovery/places";

export async function searchPlaces(input: {
  query: string;
  city: string;
  category: string;
  limit: number;
}) {
  const supabase = await createSupabaseServerClient();
  const googleEnabled = Boolean(
    process.env.GOOGLE_PLACES_API_KEY ??
      process.env.GOOGLE_MAPS_API_KEY ??
      process.env.GOOGLE_MAPS_PLACES_API_KEY,
  );

  const primary = googleEnabled
    ? await searchGooglePlaces(input)
    : await searchSerpPlaces(input);
  const fallback =
    primary.places.length > 0 || googleEnabled
      ? primary
      : await searchSerpPlaces(input);

  const dedup = Array.from(
    new Map(fallback.places.map((item) => [item.placeId, item])).values(),
  ).slice(0, input.limit);

  const existing = await supabase
    .from("places_data")
    .select("place_id, lead_id")
    .in(
      "place_id",
      dedup.map((item) => item.placeId),
    );
  const existingSet = new Set((existing.data ?? []).map((item) => item.place_id));
  const duplicatePlaceIds: string[] = [];
  const createdLeadIds: string[] = [];

  for (const place of dedup) {
    if (existingSet.has(place.placeId)) {
      duplicatePlaceIds.push(place.placeId);
      continue;
    }

    const { data: lead } = await supabase
      .from("leads")
      .insert({
        business_name: place.name,
        category: place.category,
        city: place.city ?? input.city,
        address: place.address,
        phone: "phone" in place ? place.phone : null,
        website_url: "websiteUrl" in place ? place.websiteUrl : null,
        google_maps_url: place.googleMapsUrl,
        rating: place.rating,
        review_count: place.reviewCount,
        status: "new",
        description: `Lead discovered. place_id=${place.placeId}`,
      })
      .select("id")
      .maybeSingle();

    if (!lead?.id) continue;
    createdLeadIds.push(lead.id);
    await supabase.from("places_data").insert({
      lead_id: lead.id,
      place_id: place.placeId,
      raw_data: place as unknown as Json,
    });
  }

  return {
    provider: googleEnabled ? "google_places" : "serpapi_fallback",
    foundCount: dedup.length,
    createdCount: createdLeadIds.length,
    duplicateCount: duplicatePlaceIds.length,
    duplicatePlaceIds,
    leadIds: createdLeadIds,
    places: dedup,
  };
}

export async function enrichPlaceById(input: { placeId: string; leadId?: string }) {
  const result = await enrichPlace({
    placeId: input.placeId,
    leadId: input.leadId,
  });
  const supabase = await createSupabaseServerClient();
  if (result.leadId) {
    await supabase.from("places_data").insert({
      lead_id: result.leadId,
      place_id: result.enriched.placeId,
      raw_data: result.enriched as unknown as Json,
    });
  }
  return result;
}
