import type { WebsiteColorPalette, WebsiteContact, WebsiteSection } from "@/src/lib/types/ai-website";
import { BlockContainer } from "./block-utils";

type ContactBlockProps = {
  section: WebsiteSection;
  contact: WebsiteContact;
  palette: WebsiteColorPalette;
};

export function ContactBlock({ section, contact, palette }: ContactBlockProps) {
  return (
    <BlockContainer title={section.title} subtitle={section.subtitle} palette={palette} variant={section.variant} cta={section.cta}>
      <div className="grid gap-3 md:grid-cols-2">
        <article className="rounded-2xl border bg-white/70 p-4" style={{ borderColor: `${palette.secondary}33` }}>
          <p className="text-sm opacity-75">Phone</p>
          <p className="font-semibold">{contact.phone}</p>
        </article>
        <article className="rounded-2xl border bg-white/70 p-4" style={{ borderColor: `${palette.secondary}33` }}>
          <p className="text-sm opacity-75">WhatsApp</p>
          <p className="font-semibold">{contact.whatsapp}</p>
        </article>
        <article className="rounded-2xl border bg-white/70 p-4" style={{ borderColor: `${palette.secondary}33` }}>
          <p className="text-sm opacity-75">Email</p>
          <p className="font-semibold">{contact.email}</p>
        </article>
        <article className="rounded-2xl border bg-white/70 p-4" style={{ borderColor: `${palette.secondary}33` }}>
          <p className="text-sm opacity-75">Address</p>
          <p className="font-semibold">{contact.address}</p>
        </article>
      </div>
    </BlockContainer>
  );
}
