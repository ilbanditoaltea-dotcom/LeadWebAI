import {
  BlockContainer,
  ImagePromptPlaceholder,
  type BlockProps,
  asObjectList,
  stringifyJsonValue,
} from "./block-utils";

export function PropertiesBlock({ section, palette }: BlockProps) {
  const properties = asObjectList(section.items);

  return (
    <BlockContainer title={section.title} subtitle={section.subtitle} palette={palette} variant={section.variant} cta={section.cta}>
      {section.imagePrompt ? (
        <ImagePromptPlaceholder
          prompt={section.imagePrompt}
          alt={section.imageAlt ?? `${section.title} visual`}
          palette={palette}
          compact
        />
      ) : null}
      <div className="grid gap-3 lg:grid-cols-2">
        {properties.map((property, index) => (
          <article key={index} className="rounded-2xl border bg-white/80 p-4" style={{ borderColor: `${palette.secondary}33` }}>
            <h3 className="font-semibold">{stringifyJsonValue(property.title ?? property.name ?? `Property ${index + 1}`)}</h3>
            <p className="mt-1 text-sm opacity-80">{stringifyJsonValue(property.location ?? property.description ?? "")}</p>
            <p className="mt-2 font-semibold" style={{ color: palette.primary }}>
              {stringifyJsonValue(property.price ?? "")}
            </p>
          </article>
        ))}
      </div>
    </BlockContainer>
  );
}
