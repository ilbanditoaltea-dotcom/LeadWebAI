import { BlockContainer, type BlockProps, asObjectList, stringifyJsonValue } from "./block-utils";

export function BookingBlock({ section, palette }: BlockProps) {
  const fields = asObjectList(section.items);

  return (
    <BlockContainer title={section.title} subtitle={section.subtitle} palette={palette} variant={section.variant} cta={section.cta}>
      <div className="grid gap-3 sm:grid-cols-2">
        {fields.map((field, index) => (
          <label key={index} className="text-sm font-medium">
            {stringifyJsonValue(field.field ?? `Field ${index + 1}`)}
            <input className="mt-1 w-full rounded-xl border bg-white p-3 text-sm" style={{ borderColor: `${palette.primary}33` }} readOnly />
          </label>
        ))}
      </div>
    </BlockContainer>
  );
}
