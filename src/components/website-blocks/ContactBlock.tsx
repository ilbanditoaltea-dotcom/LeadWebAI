import type { WebsiteColorPalette, WebsiteContact, WebsiteSection } from "@/src/lib/types/ai-website";
import { BlockContainer } from "./block-utils";

type ContactBlockProps = {
  section: WebsiteSection;
  contact: WebsiteContact;
  palette: WebsiteColorPalette;
};

export function ContactBlock({ section, contact, palette }: ContactBlockProps) {
  const variant = section.variant.toLowerCase();
  const showMapCard = variant === "map_card";
  const stickyCta = variant === "sticky_cta";

  return (
    <BlockContainer title={section.title} subtitle={section.subtitle} palette={palette} variant={section.variant} cta={section.cta}>
      <div className={`grid gap-3 ${variant === "split_contact" ? "md:grid-cols-2" : "md:grid-cols-2"}`}>
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
      {showMapCard ? (
        <article
          className="mt-3 rounded-2xl border bg-white/75 p-4"
          style={{ borderColor: `${palette.primary}22` }}
        >
          <p className="text-sm opacity-75">Ubicación</p>
          <p className="font-semibold">Mapa local integrado (mock) para mejorar visitas presenciales.</p>
        </article>
      ) : null}
      {stickyCta ? (
        <div
          className="sticky bottom-3 mt-3 rounded-xl border bg-white/90 p-3 text-sm font-semibold"
          style={{ borderColor: `${palette.primary}33`, color: palette.primary }}
        >
          CTA persistente recomendado: {section.cta}
        </div>
      ) : null}
    </BlockContainer>
  );
}
