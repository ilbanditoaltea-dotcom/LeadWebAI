import { BlockContainer, type BlockProps, asObjectList, stringifyJsonValue } from "./block-utils";

export function TeamBlock({ section, palette }: BlockProps) {
  const members = asObjectList(section.items);

  return (
    <BlockContainer title={section.title} subtitle={section.subtitle} palette={palette} variant={section.variant} cta={section.cta}>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {members.map((member, index) => (
          <article key={index} className="rounded-2xl border bg-white/80 p-4" style={{ borderColor: `${palette.secondary}33` }}>
            <div className="mb-3 h-14 w-14 rounded-full" style={{ backgroundColor: `${palette.primary}22` }} />
            <p className="font-semibold">{stringifyJsonValue(member.name ?? `Member ${index + 1}`)}</p>
            <p className="text-sm opacity-80">{stringifyJsonValue(member.role ?? "")}</p>
          </article>
        ))}
      </div>
    </BlockContainer>
  );
}
