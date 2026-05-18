import { BlockContainer, type BlockProps, asObjectList, stringifyJsonValue } from "./block-utils";

export function TrustBadgesBlock({ section, palette }: BlockProps) {
  const badges = asObjectList(section.items);

  return (
    <BlockContainer title={section.title} subtitle={section.subtitle} palette={palette} variant={section.variant} cta={section.cta}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {badges.map((badge, index) => (
          <article key={index} className="rounded-2xl border bg-white/80 p-4 text-center" style={{ borderColor: `${palette.secondary}33` }}>
            <p className="font-semibold">{stringifyJsonValue(badge.badge ?? badge.title ?? `Badge ${index + 1}`)}</p>
          </article>
        ))}
      </div>
    </BlockContainer>
  );
}
