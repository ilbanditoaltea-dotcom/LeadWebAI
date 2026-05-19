import { BlockContainer, type BlockProps, asObjectList, stringifyJsonValue } from "./block-utils";

export function ServicesBlock({ section, palette, design }: BlockProps) {
  const services = asObjectList(section.items);
  const variant = section.variant.toLowerCase();
  const wrapperClass = variant === "horizontal_rows" ? "space-y-3" : "grid gap-3 sm:grid-cols-2 lg:grid-cols-3";
  const cardClass =
    variant === "editorial_list"
      ? "rounded-2xl border-l-4 bg-white/70 p-4"
      : variant === "pricing_cards"
        ? "rounded-2xl border bg-white/90 p-5 shadow-sm"
        : "rounded-2xl border bg-white/70 p-4";

  return (
    <BlockContainer
      title={section.title}
      subtitle={section.subtitle}
      palette={palette}
      variant={section.variant}
      cta={section.cta}
      design={design}
    >
      <div className={wrapperClass}>
        {services.map((service, index) => (
          <article
            key={index}
            className={cardClass}
            style={{
              borderColor: `${palette.primary}22`,
              borderLeftColor:
                variant === "editorial_list" ? `${palette.accent}` : undefined,
            }}
          >
            <p className="font-semibold">{stringifyJsonValue(service.service ?? service.name ?? `Service ${index + 1}`)}</p>
            <p className="mt-1 text-sm opacity-80">{stringifyJsonValue(service.description ?? service.icon ?? "")}</p>
            {variant === "pricing_cards" ? (
              <p className="mt-2 text-sm font-semibold" style={{ color: palette.primary }}>
                {stringifyJsonValue(service.price ?? "Consultar precio")}
              </p>
            ) : null}
          </article>
        ))}
      </div>
    </BlockContainer>
  );
}
