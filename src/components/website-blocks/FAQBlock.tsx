import { BlockContainer, type BlockProps, asObjectList, stringifyJsonValue } from "./block-utils";

export function FAQBlock({ section, palette }: BlockProps) {
  const faqItems = asObjectList(section.items);

  return (
    <BlockContainer title={section.title} subtitle={section.subtitle} palette={palette} variant={section.variant} cta={section.cta}>
      <div className="space-y-3">
        {faqItems.map((item, index) => (
          <details key={index} className="rounded-2xl border bg-white/70 p-4" style={{ borderColor: `${palette.primary}22` }}>
            <summary className="cursor-pointer font-semibold">{stringifyJsonValue(item.question ?? `Question ${index + 1}`)}</summary>
            <p className="mt-2 text-sm opacity-80">{stringifyJsonValue(item.answer ?? "")}</p>
          </details>
        ))}
      </div>
    </BlockContainer>
  );
}
