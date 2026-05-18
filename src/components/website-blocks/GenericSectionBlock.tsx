import { BlockContainer, type BlockProps, asObjectList, stringifyJsonValue } from "./block-utils";

export function GenericSectionBlock({ section, palette }: BlockProps) {
  const objectItems = asObjectList(section.items);

  return (
    <BlockContainer
      title={section.title}
      subtitle={section.subtitle}
      palette={palette}
      variant={section.variant}
      cta={section.cta}
    >
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {objectItems.length > 0
          ? objectItems.map((item, index) => (
              <article
                key={`${section.type}-${index}`}
                className="rounded-2xl border bg-white/70 p-4"
                style={{ borderColor: `${palette.secondary}33` }}
              >
                {Object.entries(item).map(([key, value]) => (
                  <p key={key} className="text-sm">
                    <span className="font-semibold capitalize">{key.replaceAll("_", " ")}: </span>
                    <span>{stringifyJsonValue(value)}</span>
                  </p>
                ))}
              </article>
            ))
          : section.items.map((item, index) => (
              <article
                key={`${section.type}-plain-${index}`}
                className="rounded-2xl border bg-white/70 p-4 text-sm"
                style={{ borderColor: `${palette.secondary}33` }}
              >
                {stringifyJsonValue(item)}
              </article>
            ))}
      </div>
    </BlockContainer>
  );
}
