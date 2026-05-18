"use client";

import type { GeneratedWebsite, WebsiteSection } from "@/src/lib/types/ai-website";
import { BeforeAfterBlock } from "./BeforeAfterBlock";
import { BookingBlock } from "./BookingBlock";
import { CatalogBlock } from "./CatalogBlock";
import { ContactBlock } from "./ContactBlock";
import { FAQBlock } from "./FAQBlock";
import { FinalCTABlock } from "./FinalCTABlock";
import { GalleryBlock } from "./GalleryBlock";
import { GenericSectionBlock } from "./GenericSectionBlock";
import { HeroBlock } from "./HeroBlock";
import { InstagramBlock } from "./InstagramBlock";
import { LeadCaptureFormBlock } from "./LeadCaptureFormBlock";
import { LocationBlock } from "./LocationBlock";
import { MenuBlock } from "./MenuBlock";
import { OffersBlock } from "./OffersBlock";
import { OpeningHoursBlock } from "./OpeningHoursBlock";
import { PricingBlock } from "./PricingBlock";
import { ProcessBlock } from "./ProcessBlock";
import { PropertiesBlock } from "./PropertiesBlock";
import { ReviewsBlock } from "./ReviewsBlock";
import { ServicesBlock } from "./ServicesBlock";
import { StoryBlock } from "./StoryBlock";
import { TeamBlock } from "./TeamBlock";
import { TrustBadgesBlock } from "./TrustBadgesBlock";

type WebsiteRendererProps = {
  data: GeneratedWebsite;
};

function renderSection(section: WebsiteSection, data: GeneratedWebsite) {
  const palette = data.businessProfile.colorPalette;

  switch (section.type) {
    case "services":
      return <ServicesBlock section={section} palette={palette} />;
    case "menu":
      return <MenuBlock section={section} palette={palette} />;
    case "booking":
      return <BookingBlock section={section} palette={palette} />;
    case "contact":
      return <ContactBlock section={section} palette={palette} contact={data.website.contact} />;
    case "reviews":
      return <ReviewsBlock section={section} palette={palette} />;
    case "gallery":
      return <GalleryBlock section={section} palette={palette} />;
    case "faq":
      return <FAQBlock section={section} palette={palette} />;
    case "catalog":
      return <CatalogBlock section={section} palette={palette} />;
    case "properties":
      return <PropertiesBlock section={section} palette={palette} />;
    case "before_after":
      return <BeforeAfterBlock section={section} palette={palette} />;
    case "team":
      return <TeamBlock section={section} palette={palette} />;
    case "location":
      return <LocationBlock section={section} palette={palette} />;
    case "pricing":
      return <PricingBlock section={section} palette={palette} />;
    case "offers":
      return <OffersBlock section={section} palette={palette} />;
    case "process":
      return <ProcessBlock section={section} palette={palette} />;
    case "trust_badges":
      return <TrustBadgesBlock section={section} palette={palette} />;
    case "final_cta":
      return <FinalCTABlock section={section} palette={palette} />;
    case "instagram":
      return <InstagramBlock section={section} palette={palette} />;
    case "opening_hours":
      return <OpeningHoursBlock section={section} palette={palette} />;
    case "story":
      return <StoryBlock section={section} palette={palette} />;
    case "lead_capture_form":
      return <LeadCaptureFormBlock section={section} palette={palette} />;
    case "featured_products":
      return <CatalogBlock section={section} palette={palette} />;
    default:
      return <GenericSectionBlock section={section} palette={palette} />;
  }
}

export function WebsiteRenderer({ data }: WebsiteRendererProps) {
  const palette = data.businessProfile.colorPalette;
  const orderedSections = [...data.website.sections].sort((a, b) => a.order - b.order);

  return (
    <div className="min-h-screen w-full" style={{ backgroundColor: palette.background, color: palette.text }}>
      <main className="mx-auto w-full max-w-6xl space-y-6 px-4 py-6 md:px-8 md:py-10">
        <HeroBlock website={data} />
        {orderedSections.map((section, index) => (
          <div key={`${section.type}-${section.order}-${index}`}>{renderSection(section, data)}</div>
        ))}
      </main>
      <footer className="border-t px-4 py-8 md:px-8" style={{ borderColor: `${palette.primary}33` }}>
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-semibold">{data.businessProfile.businessName}</p>
            <p className="text-xs opacity-75">{data.website.contact.address}</p>
          </div>
          <p className="text-xs opacity-70">{data.website.seo.description}</p>
        </div>
      </footer>
    </div>
  );
}
