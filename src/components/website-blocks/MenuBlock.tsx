import {
  BlockContainer,
  ImagePromptPlaceholder,
  type BlockProps,
  asObjectList,
  stringifyJsonValue,
} from "./block-utils";

export function MenuBlock({ section, palette, design }: BlockProps) {
  const items = asObjectList(section.items);
  const variant = section.variant.toLowerCase();
  const wrapperClass =
    variant === "menu_cards"
      ? "grid gap-3 sm:grid-cols-2"
      : variant === "highlighted_specials"
        ? "space-y-3"
        : "space-y-3";

  return (
    <BlockContainer
      title={section.title}
      subtitle={section.subtitle}
      palette={palette}
      variant={section.variant}
      cta={section.cta}
      design={design}
    >
      {section.imagePrompt ? (
        <ImagePromptPlaceholder
          prompt={section.imagePrompt}
          alt={section.imageAlt ?? `${section.title} visual`}
          palette={palette}
          compact
        />
      ) : null}
      <div className={wrapperClass}>
        {items.map((item, index) => (
          <article
            key={index}
            className={`flex flex-wrap items-center justify-between gap-2 rounded-2xl border bg-white/70 p-4 ${
              variant === "highlighted_specials" && index === 0 ? "ring-2" : ""
            }`}
            style={{ borderColor: `${palette.secondary}33` }}
          >
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
