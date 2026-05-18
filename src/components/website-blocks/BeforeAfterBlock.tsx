import {
  BlockContainer,
  ImagePromptPlaceholder,
  type BlockProps,
  asObjectList,
  stringifyJsonValue,
} from "./block-utils";

export function BeforeAfterBlock({ section, palette }: BlockProps) {
  const comparisons = asObjectList(section.items);

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
        {comparisons.map((comparison, index) => (
          <article key={index} className="grid gap-3 rounded-2xl border bg-white/80 p-4 md:grid-cols-2" style={{ borderColor: `${palette.primary}22` }}>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide opacity-70">Before</p>
              <p>{stringifyJsonValue(comparison.before ?? "")}</p>
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide opacity-70">After</p>
              <p>{stringifyJsonValue(comparison.after ?? "")}</p>
            </div>
          </article>
        ))}
      </div>
    </BlockContainer>
  );
}
