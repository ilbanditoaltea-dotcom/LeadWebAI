import { BlockContainer, type BlockProps, asObjectList, stringifyJsonValue } from "./block-utils";

export function OffersBlock({ section, palette }: BlockProps) {
  const offers = asObjectList(section.items);

  return (
    <BlockContainer title={section.title} subtitle={section.subtitle} palette={palette} variant={section.variant} cta={section.cta}>
      <div className="grid gap-3 sm:grid-cols-2">
        {offers.map((offer, index) => (
          <article key={index} className="rounded-2xl border p-4" style={{ borderColor: `${palette.secondary}33`, backgroundColor: `${palette.secondary}12` }}>
            <p className="font-semibold">{stringifyJsonValue(offer.title ?? offer.name ?? `Offer ${index + 1}`)}</p>
            <p className="mt-1 text-sm opacity-80">{stringifyJsonValue(offer.description ?? "")}</p>
          </article>
        ))}
      </div>
    </BlockContainer>
  );
}
