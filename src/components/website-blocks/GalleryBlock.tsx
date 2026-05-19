import {
  BlockContainer,
  ImagePromptPlaceholder,
  type BlockProps,
  asObjectList,
  stringifyJsonValue,
} from "./block-utils";

export function GalleryBlock({ section, palette, design }: BlockProps) {
  const images = asObjectList(section.items);
  const variant = section.variant.toLowerCase();
  const gridClass =
    variant === "masonry"
      ? "columns-1 gap-3 sm:columns-2 lg:columns-3"
      : variant === "wide_banner"
        ? "grid gap-3 md:grid-cols-1"
        : variant === "before_after_grid"
          ? "grid gap-3 md:grid-cols-2"
          : "grid gap-3 sm:grid-cols-2 lg:grid-cols-3";

  return (
    <BlockContainer
      title={section.title}
      subtitle={section.subtitle}
      palette={palette}
      variant={section.variant}
      cta={section.cta}
      design={design}
    >
      <div className={gridClass}>
        {images.map((image, index) => (
          <article
            key={index}
            className={`rounded-2xl border p-4 ${variant === "masonry" ? "mb-3 break-inside-avoid" : ""}`}
            style={{ borderColor: `${palette.primary}22`, backgroundColor: `${palette.secondary}12` }}
          >
            <ImagePromptPlaceholder
              prompt={stringifyJsonValue(image.imagePrompt ?? image.caption ?? `Gallery item ${index + 1}`)}
              alt={stringifyJsonValue(image.imageAlt ?? `Imagen de galeria ${index + 1}`)}
              palette={palette}
              compact
            />
          </article>
        ))}
      </div>
    </BlockContainer>
  );
}
