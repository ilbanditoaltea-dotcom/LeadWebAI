import {
  BlockContainer,
  ImagePromptPlaceholder,
  type BlockProps,
  asObjectList,
  stringifyJsonValue,
} from "./block-utils";

export function GalleryBlock({ section, palette }: BlockProps) {
  const images = asObjectList(section.items);

  return (
    <BlockContainer title={section.title} subtitle={section.subtitle} palette={palette} variant={section.variant} cta={section.cta}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image, index) => (
          <article key={index} className="rounded-2xl border p-4" style={{ borderColor: `${palette.primary}22`, backgroundColor: `${palette.secondary}12` }}>
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
