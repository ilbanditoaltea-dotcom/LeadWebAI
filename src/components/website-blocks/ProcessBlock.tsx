import { BlockContainer, type BlockProps, asObjectList, stringifyJsonValue } from "./block-utils";

export function ProcessBlock({ section, palette }: BlockProps) {
  const steps = asObjectList(section.items);

  return (
    <BlockContainer title={section.title} subtitle={section.subtitle} palette={palette} variant={section.variant} cta={section.cta}>
      <ol className="grid gap-3 md:grid-cols-2">
        {steps.map((step, index) => (
          <li key={index} className="rounded-2xl border bg-white/80 p-4" style={{ borderColor: `${palette.primary}22` }}>
            <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: palette.primary }}>
              Step {index + 1}
            </p>
            <p className="mt-1 font-semibold">{stringifyJsonValue(step.title ?? step.name ?? `Step ${index + 1}`)}</p>
            <p className="mt-1 text-sm opacity-80">{stringifyJsonValue(step.description ?? "")}</p>
          </li>
        ))}
      </ol>
    </BlockContainer>
  );
}
