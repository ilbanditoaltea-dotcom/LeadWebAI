import { BlockContainer, type BlockProps, asObjectList, stringifyJsonValue } from "./block-utils";

export function PricingBlock({ section, palette }: BlockProps) {
  const plans = asObjectList(section.items);

  return (
    <BlockContainer title={section.title} subtitle={section.subtitle} palette={palette} variant={section.variant} cta={section.cta}>
      <div className="grid gap-3 md:grid-cols-3">
        {plans.map((plan, index) => (
          <article key={index} className="rounded-2xl border bg-white/80 p-4" style={{ borderColor: `${palette.primary}22` }}>
            <p className="font-semibold">{stringifyJsonValue(plan.name ?? `Plan ${index + 1}`)}</p>
            <p className="my-2 text-2xl font-bold" style={{ color: palette.primary }}>
              {stringifyJsonValue(plan.price ?? "")}
            </p>
            <p className="text-sm opacity-80">{stringifyJsonValue(plan.description ?? "")}</p>
          </article>
        ))}
      </div>
    </BlockContainer>
  );
}
