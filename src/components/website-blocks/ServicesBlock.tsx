import { BlockContainer, type BlockProps, asObjectList, stringifyJsonValue } from "./block-utils";

export function ServicesBlock({ section, palette }: BlockProps) {
  const services = asObjectList(section.items);

  return (
    <BlockContainer title={section.title} subtitle={section.subtitle} palette={palette} variant={section.variant} cta={section.cta}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {services.map((service, index) => (
          <article key={index} className="rounded-2xl border bg-white/70 p-4" style={{ borderColor: `${palette.primary}22` }}>
            <p className="font-semibold">{stringifyJsonValue(service.service ?? service.name ?? `Service ${index + 1}`)}</p>
            <p className="mt-1 text-sm opacity-80">{stringifyJsonValue(service.description ?? service.icon ?? "")}</p>
          </article>
        ))}
      </div>
    </BlockContainer>
  );
}
