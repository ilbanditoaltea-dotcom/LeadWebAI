import {
  BlockContainer,
  ImagePromptPlaceholder,
  type BlockProps,
  asObjectList,
  stringifyJsonValue,
} from "./block-utils";

export function MenuBlock({ section, palette }: BlockProps) {
  const items = asObjectList(section.items);

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
      <div className="space-y-3">
        {items.map((item, index) => (
          <article key={index} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border bg-white/70 p-4" style={{ borderColor: `${palette.secondary}33` }}>
            <div>
              <p className="font-semibold">{stringifyJsonValue(item.name ?? `Item ${index + 1}`)}</p>
              <p className="text-sm opacity-80">{stringifyJsonValue(item.tag ?? item.description ?? "")}</p>
            </div>
            <p className="font-semibold" style={{ color: palette.primary }}>
              {stringifyJsonValue(item.price ?? "")}
            </p>
          </article>
        ))}
      </div>
    </BlockContainer>
  );
}
