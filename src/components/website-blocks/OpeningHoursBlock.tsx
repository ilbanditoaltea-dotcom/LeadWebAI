import { BlockContainer, type BlockProps, asObjectList, stringifyJsonValue } from "./block-utils";

export function OpeningHoursBlock({ section, palette }: BlockProps) {
  const days = asObjectList(section.items);

  return (
    <BlockContainer title={section.title} subtitle={section.subtitle} palette={palette} variant={section.variant} cta={section.cta}>
      <div className="space-y-2">
        {days.map((day, index) => (
          <article key={index} className="flex items-center justify-between rounded-2xl border bg-white/80 p-4" style={{ borderColor: `${palette.primary}22` }}>
            <p className="font-medium">{stringifyJsonValue(day.day ?? `Day ${index + 1}`)}</p>
            <p className="text-sm opacity-80">{stringifyJsonValue(day.hours ?? "")}</p>
          </article>
        ))}
      </div>
    </BlockContainer>
  );
}
