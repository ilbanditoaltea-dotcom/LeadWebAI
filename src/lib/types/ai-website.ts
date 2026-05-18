export const BUSINESS_TYPES = [
  "restaurant",
  "bar",
  "clinic",
  "beauty",
  "barbershop",
  "real_estate",
  "shop",
  "academy",
  "fitness",
  "hotel",
  "automotive",
  "generic",
] as const;

export type BusinessType = (typeof BUSINESS_TYPES)[number];

export const WEBSITE_GOALS = [
  "get_reservations",
  "get_appointments",
  "get_calls",
  "get_whatsapp_messages",
  "sell_products",
  "capture_leads",
  "show_catalog",
  "build_trust",
  "promote_services",
] as const;

export type WebsiteGoal = (typeof WEBSITE_GOALS)[number];

export const VISUAL_STYLES = [
  "premium_dark",
  "clean_medical",
  "warm_restaurant",
  "modern_minimal",
  "luxury",
  "playful",
  "industrial",
  "natural",
  "corporate",
  "mediterranean",
  "vintage",
  "urban",
] as const;

export type VisualStyle = (typeof VISUAL_STYLES)[number];

export const SECTION_TYPES = [
  "hero",
  "services",
  "menu",
  "booking",
  "contact",
  "reviews",
  "gallery",
  "faq",
  "catalog",
  "properties",
  "before_after",
  "team",
  "location",
  "pricing",
  "offers",
  "process",
  "trust_badges",
  "final_cta",
  "instagram",
  "opening_hours",
  "story",
  "featured_products",
  "lead_capture_form",
] as const;

export type SectionType = (typeof SECTION_TYPES)[number];

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonObject | JsonValue[];
export type JsonObject = { [key: string]: JsonValue };

export interface WebsiteColorPalette {
  primary: string;
  secondary: string;
  background: string;
  text: string;
  accent: string;
}

export interface WebsiteBusinessProfile {
  businessName: string;
  businessType: BusinessType;
  city: string;
  category: string;
  targetCustomer: string;
  mainGoal: WebsiteGoal;
  tone: string;
  visualStyle: VisualStyle;
  colorPalette: WebsiteColorPalette;
  fontStyle: string;
  imageStyle: string;
}

export interface WebsiteHero {
  variant: string;
  title: string;
  subtitle: string;
  eyebrow: string;
  primaryCTA: string;
  secondaryCTA: string;
  backgroundImagePrompt: string;
}

export interface WebsiteSection {
  type: SectionType;
  variant: string;
  title: string;
  subtitle: string;
  imagePrompt?: string;
  imageAlt?: string;
  items: JsonValue[];
  cta: string;
  order: number;
}

export interface WebsiteSeo {
  title: string;
  description: string;
  keywords: string[];
}

export interface WebsiteContact {
  phone: string;
  email: string;
  whatsapp: string;
  address: string;
}

export interface WebsiteConfidence {
  reasoning: string;
  salesAngle: string;
  detectedProblems: string[];
  recommendedFeatures: string[];
}

export interface GeneratedWebsite {
  id: string;
  leadId: string;
  businessProfile: WebsiteBusinessProfile;
  website: {
    hero: WebsiteHero;
    sections: WebsiteSection[];
    seo: WebsiteSeo;
    contact: WebsiteContact;
    confidence: WebsiteConfidence;
  };
}

export const generatedWebsiteMocks: GeneratedWebsite[] = [
  {
    id: "restaurant-demo",
    leadId: "lead_roma_fiore_001",
    businessProfile: {
      businessName: "Trattoria Roma Fiore",
      businessType: "restaurant",
      city: "Madrid",
      category: "Italian Restaurant",
      targetCustomer: "Couples and families looking for authentic Italian food",
      mainGoal: "get_reservations",
      tone: "Warm, elegant, appetizing",
      visualStyle: "mediterranean",
      colorPalette: {
        primary: "#A61E1E",
        secondary: "#D9A441",
        background: "#FFF9F2",
        text: "#2E2018",
        accent: "#2C7A4B",
      },
      fontStyle: "Serif headings with clean sans body",
      imageStyle: "Cinematic food photography with warm lights",
    },
    website: {
      hero: {
        variant: "split-image",
        title: "Italian flavor that feels like home",
        subtitle: "Fresh pasta, wood-fired pizza and a cozy atmosphere in the center of Madrid.",
        eyebrow: "Authentic Trattoria",
        primaryCTA: "Book a table",
        secondaryCTA: "View menu",
        backgroundImagePrompt:
          "Cozy Italian restaurant interior, warm tungsten light, plated pasta close-up, premium editorial style",
      },
      sections: [
        {
          type: "menu",
          variant: "featured-categories",
          title: "Our favorites",
          subtitle: "Traditional recipes made with premium ingredients.",
          items: [
            { name: "Tagliatelle al Tartufo", price: "18 EUR", tag: "Chef pick" },
            { name: "Margherita DOP", price: "14 EUR", tag: "Classic" },
            { name: "Tiramisu della Casa", price: "7 EUR", tag: "Best seller" },
          ],
          cta: "See full menu",
          order: 1,
        },
        {
          type: "reviews",
          variant: "cards",
          title: "Guests love us",
          subtitle: "Real experiences from diners.",
          items: [
            { author: "Laura M.", rating: 5, text: "Best carbonara in the city." },
            { author: "Diego P.", rating: 5, text: "Great service and atmosphere." },
          ],
          cta: "Read more reviews",
          order: 2,
        },
        {
          type: "booking",
          variant: "inline-form",
          title: "Reserve your table",
          subtitle: "Quick reservation in under 30 seconds.",
          items: [
            { field: "date", required: true },
            { field: "time", required: true },
            { field: "guests", required: true },
          ],
          cta: "Confirm reservation",
          order: 3,
        },
        {
          type: "final_cta",
          variant: "banner",
          title: "Tonight deserves great Italian food",
          subtitle: "Limited seats available for dinner service.",
          items: [],
          cta: "Book now",
          order: 4,
        },
      ],
      seo: {
        title: "Trattoria Roma Fiore | Italian Restaurant in Madrid",
        description:
          "Authentic Italian restaurant in Madrid. Book your table online and enjoy handmade pasta and wood-fired pizza.",
        keywords: ["italian restaurant madrid", "book table madrid", "fresh pasta"],
      },
      contact: {
        phone: "+34 911 123 456",
        email: "reservas@romafiore.es",
        whatsapp: "+34 611 123 456",
        address: "Calle de Serrano 120, Madrid",
      },
      confidence: {
        reasoning:
          "Business depends on high-intent local traffic and immediate reservation conversion.",
        salesAngle:
          "Showcase appetite appeal and simplify booking flow to reduce decision friction.",
        detectedProblems: [
          "Current website has no clear reservation CTA above the fold.",
          "Menu is hard to scan on mobile devices.",
          "Limited social proof visible on first visit.",
        ],
        recommendedFeatures: [
          "Sticky reservation button",
          "Optimized menu cards for mobile",
          "Google reviews integration",
        ],
      },
    },
  },
  {
    id: "clinic-demo",
    leadId: "lead_sonrisa_plus_001",
    businessProfile: {
      businessName: "Clinica Sonrisa Plus",
      businessType: "clinic",
      city: "Valencia",
      category: "Dental Clinic",
      targetCustomer: "Families and professionals seeking trusted dental care",
      mainGoal: "get_appointments",
      tone: "Professional, calm, trustworthy",
      visualStyle: "clean_medical",
      colorPalette: {
        primary: "#2563EB",
        secondary: "#14B8A6",
        background: "#F8FAFC",
        text: "#0F172A",
        accent: "#A78BFA",
      },
      fontStyle: "Modern geometric sans",
      imageStyle: "Bright clinic photography with clean composition",
    },
    website: {
      hero: {
        variant: "trust-focused",
        title: "Healthy smiles with expert dental care",
        subtitle:
          "Comprehensive dentistry, modern technology and personalized treatment plans.",
        eyebrow: "Top-rated clinic in Valencia",
        primaryCTA: "Book your consultation",
        secondaryCTA: "Call now",
        backgroundImagePrompt:
          "Modern dental clinic interior, bright daylight, dentist and patient smiling, ultra clean aesthetic",
      },
      sections: [
        {
          type: "services",
          variant: "icon-grid",
          title: "Treatments",
          subtitle: "Prevention, aesthetics and advanced oral care.",
          items: [
            { service: "General dentistry", icon: "shield-check" },
            { service: "Invisible orthodontics", icon: "sparkles" },
            { service: "Dental implants", icon: "tooth" },
          ],
          cta: "See all treatments",
          order: 1,
        },
        {
          type: "team",
          variant: "medical-profiles",
          title: "Specialist team",
          subtitle: "Experienced professionals focused on patient comfort.",
          items: [
            { name: "Dr. Carla Gomez", role: "Implantology" },
            { name: "Dr. Martin Ruiz", role: "Orthodontics" },
          ],
          cta: "Meet the team",
          order: 2,
        },
        {
          type: "lead_capture_form",
          variant: "appointment-form",
          title: "Request an appointment",
          subtitle: "We confirm your slot in less than 1 business hour.",
          items: [
            { field: "name", required: true },
            { field: "phone", required: true },
            { field: "preferredDate", required: false },
          ],
          cta: "Send request",
          order: 3,
        },
        {
          type: "trust_badges",
          variant: "certifications",
          title: "Why patients trust us",
          subtitle: "Accreditation, technology and proven outcomes.",
          items: [
            { badge: "Certified specialists" },
            { badge: "Advanced digital diagnostics" },
            { badge: "4.9 average rating" },
          ],
          cta: "Read patient stories",
          order: 4,
        },
      ],
      seo: {
        title: "Clinica Sonrisa Plus | Dental Clinic in Valencia",
        description:
          "Book your dental appointment in Valencia. Specialist team, modern equipment and personalized care.",
        keywords: ["dental clinic valencia", "book dentist appointment", "dental implants"],
      },
      contact: {
        phone: "+34 960 555 201",
        email: "hola@sonrisaplus.es",
        whatsapp: "+34 622 888 201",
        address: "Avenida del Puerto 44, Valencia",
      },
      confidence: {
        reasoning:
          "Clinic conversion depends on trust markers and frictionless appointment flow.",
        salesAngle:
          "Highlight safety, expertise and speed of care to drive consultation requests.",
        detectedProblems: [
          "Website lacks clear treatment hierarchy.",
          "Contact options are buried below the fold.",
          "No specialist profiles to build credibility.",
        ],
        recommendedFeatures: [
          "Treatment quick navigation",
          "One-step appointment form",
          "Team credibility section",
        ],
      },
    },
  },
  {
    id: "barbershop-demo",
    leadId: "lead_oldtown_barber_001",
    businessProfile: {
      businessName: "Old Town Barber Club",
      businessType: "barbershop",
      city: "Barcelona",
      category: "Vintage Barbershop",
      targetCustomer: "Men looking for premium grooming and classic style",
      mainGoal: "get_whatsapp_messages",
      tone: "Confident, masculine, nostalgic",
      visualStyle: "vintage",
      colorPalette: {
        primary: "#111827",
        secondary: "#B45309",
        background: "#0B0B0E",
        text: "#F5E9D0",
        accent: "#7C2D12",
      },
      fontStyle: "Vintage serif display with condensed sans",
      imageStyle: "Moody barbershop portraits, film grain look",
    },
    website: {
      hero: {
        variant: "full-bleed",
        title: "Classic cuts. Modern precision.",
        subtitle: "Barbershop rituals, beard styling and premium grooming in Barcelona.",
        eyebrow: "Since 1998",
        primaryCTA: "Book via WhatsApp",
        secondaryCTA: "See services",
        backgroundImagePrompt:
          "Vintage barbershop interior, leather chair, warm contrast lighting, cinematic portrait of barber",
      },
      sections: [
        {
          type: "services",
          variant: "price-list-dark",
          title: "Signature services",
          subtitle: "Tailored to your style.",
          items: [
            { name: "Classic haircut", duration: "45 min", price: "24 EUR" },
            { name: "Beard sculpting", duration: "30 min", price: "18 EUR" },
            { name: "Full grooming combo", duration: "75 min", price: "38 EUR" },
          ],
          cta: "Reserve your slot",
          order: 1,
        },
        {
          type: "before_after",
          variant: "split-dark",
          title: "Before & after",
          subtitle: "Visible improvements in every detail.",
          items: [
            {
              before: "Uneven beard lines and low definition around jawline.",
              after: "Sharp contour, volume balance and clean neckline.",
            },
            {
              before: "Flat haircut shape with no texture.",
              after: "Textured fade with natural flow and stronger profile.",
            },
          ],
          cta: "See transformations",
          order: 2,
        },
        {
          type: "booking",
          variant: "whatsapp-booking-dark",
          title: "Book your session",
          subtitle: "Reserve your slot in under one minute.",
          items: [
            { field: "Service", required: true },
            { field: "Preferred date", required: true },
            { field: "WhatsApp number", required: true },
          ],
          cta: "Book via WhatsApp",
          order: 3,
        },
        {
          type: "final_cta",
          variant: "whatsapp-highlight",
          title: "Need a cut this week?",
          subtitle: "Message us now and we will confirm your best slot.",
          items: [],
          cta: "Open WhatsApp",
          order: 4,
        },
      ],
      seo: {
        title: "Old Town Barber Club | Vintage Barbershop Barcelona",
        description:
          "Premium barbershop in Barcelona. Book your haircut or beard grooming via WhatsApp.",
        keywords: ["barbershop barcelona", "book haircut whatsapp", "vintage barber"],
      },
      contact: {
        phone: "+34 933 777 910",
        email: "booking@oldtownbarber.es",
        whatsapp: "+34 655 777 910",
        address: "Carrer del Carme 88, Barcelona",
      },
      confidence: {
        reasoning:
          "Fast messaging and visual proof are key conversion triggers for this business type.",
        salesAngle:
          "Use strong style identity and immediate WhatsApp booking to increase booked appointments.",
        detectedProblems: [
          "Current branding is inconsistent across pages.",
          "No clear WhatsApp CTA in first screen.",
          "Portfolio content is not organized by style.",
        ],
        recommendedFeatures: [
          "Persistent WhatsApp button",
          "Style-focused gallery blocks",
          "Service cards with transparent pricing",
        ],
      },
    },
  },
];

export const generatedWebsiteMocksById: Record<string, GeneratedWebsite> =
  generatedWebsiteMocks.reduce<Record<string, GeneratedWebsite>>((acc, website) => {
    acc[website.id] = website;
    return acc;
  }, {});

export function getGeneratedWebsiteMockById(id: string): GeneratedWebsite | null {
  return generatedWebsiteMocksById[id] ?? null;
}
