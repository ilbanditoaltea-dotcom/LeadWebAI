import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WebsiteRenderer } from "@/src/components/website-blocks/WebsiteRenderer";
import type { GeneratedWebsite, JsonValue } from "@/src/lib/types/ai-website";
import { createSupabaseServerClient } from "@/src/lib/supabase/server";
import { hasValidSupabaseEnv } from "@/src/lib/supabase/env";
import type { Database } from "@/src/lib/supabase/database.types";
import { generateCustomWebsiteOutputSchema } from "@/src/lib/ai/generate-custom-website";
import { getGeneratedWebsiteMockById } from "@/src/lib/types/ai-website";
import { getDemoBusinessCaseByDemoIdOrSlug } from "@/app/lib/demo-business-cases";

type DemoPageProps = {
  params: Promise<{ id: string }>;
};

type GeneratedWebsiteRow = Database["public"]["Tables"]["generated_websites"]["Row"];

function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

async function getGeneratedWebsiteRecord(idOrSlug: string): Promise<GeneratedWebsiteRow | null> {
  if (!hasValidSupabaseEnv()) {
    return null;
  }

  try {
    const supabase = await createSupabaseServerClient();

    const { data: bySlug, error: slugError } = await supabase
      .from("generated_websites")
      .select("*")
      .eq("demo_slug", idOrSlug)
      .maybeSingle();

    if (!slugError && bySlug) {
      return bySlug;
    }

    if (!isUuid(idOrSlug)) {
      return null;
    }

    const { data: byId, error: idError } = await supabase
      .from("generated_websites")
      .select("*")
      .eq("id", idOrSlug)
      .maybeSingle();

    if (idError || !byId) {
      return null;
    }

    return byId;
  } catch {
    return null;
  }
}

function mapRowToGeneratedWebsite(row: GeneratedWebsiteRow): GeneratedWebsite | null {
  const parsed = generateCustomWebsiteOutputSchema.safeParse({
    businessProfile: row.business_profile,
    website: row.website,
    seo: row.seo ?? {
      title: "Demo generada por LeadWeb AI",
      description: "Propuesta visual personalizada para negocio local.",
      keywords: [],
    },
    contact: row.contact ?? {
      phone: "unknown",
      email: "unknown",
      whatsapp: "unknown",
      address: "unknown",
    },
    confidence: row.confidence ?? {
      reasoning: "unknown",
      salesAngle: "unknown",
      detectedProblems: [],
      recommendedFeatures: [],
    },
  });

  if (!parsed.success) {
    return null;
  }

  return {
    id: row.id,
    leadId: row.lead_id ?? "unknown",
    businessProfile: parsed.data.businessProfile,
    website: {
      hero: parsed.data.website.hero,
      sections: parsed.data.website.sections.map((section) => ({
        ...section,
        items: Array.isArray(section.items) ? (section.items as JsonValue[]) : [],
      })),
      seo: parsed.data.seo,
      contact: parsed.data.contact,
      confidence: parsed.data.confidence,
    },
  };
}

async function getGeneratedWebsite(idOrSlug: string): Promise<GeneratedWebsite | null> {
  const row = await getGeneratedWebsiteRecord(idOrSlug);
  if (row) {
    return mapRowToGeneratedWebsite(row);
  }

  const fallback = getDemoBusinessCaseByDemoIdOrSlug(idOrSlug);
  if (fallback) {
    return fallback.generatedWebsite;
  }

  return getGeneratedWebsiteMockById(idOrSlug);
}

export async function generateMetadata({ params }: DemoPageProps): Promise<Metadata> {
  const { id } = await params;
  const website = await getGeneratedWebsite(id);

  if (!website) {
    return {
      title: "Demo no encontrada | LeadWeb AI",
      description: "No hemos encontrado esta demo publica.",
    };
  }

  return {
    title: website.website.seo.title || website.businessProfile.businessName,
    description:
      website.website.seo.description ||
      `Demo visual para ${website.businessProfile.businessName}`,
    keywords: website.website.seo.keywords,
  };
}

export default async function DemoPage({ params }: DemoPageProps) {
  const { id } = await params;
  const website = await getGeneratedWebsite(id);

  if (!website) {
    notFound();
  }

  return (
    <div className="relative">
      <WebsiteRenderer data={website} />
      <button
        type="button"
        className="fixed bottom-4 right-4 z-30 rounded-full border border-white/60 bg-black/55 px-4 py-2 text-xs font-medium text-white shadow-lg backdrop-blur md:bottom-6 md:right-6"
      >
        Demo visual - propuesta no oficial
      </button>
    </div>
  );
}
