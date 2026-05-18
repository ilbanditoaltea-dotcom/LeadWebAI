import { BlockContainer, type BlockProps, asObjectList, stringifyJsonValue } from "./block-utils";

export function LeadCaptureFormBlock({ section, palette }: BlockProps) {
  const fields = asObjectList(section.items);

  return (
    <BlockContainer title={section.title} subtitle={section.subtitle} palette={palette} variant={section.variant}>
      <form className="grid gap-3 sm:grid-cols-2">
        {fields.map((field, index) => (
          <label key={index} className="text-sm font-medium">
            {stringifyJsonValue(field.field ?? `Field ${index + 1}`)}
            <input className="mt-1 w-full rounded-xl border bg-white p-3 text-sm" style={{ borderColor: `${palette.primary}33` }} readOnly />
          </label>
        ))}
        <button
          type="button"
          className="sm:col-span-2 mt-2 rounded-xl px-4 py-3 text-sm font-semibold text-white"
          style={{ backgroundColor: palette.primary }}
        >
          {section.cta}
        </button>
      </form>
    </BlockContainer>
  );
}
