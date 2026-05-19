import { BlockContainer, type BlockProps, asObjectList, stringifyJsonValue } from "./block-utils";

export function BookingBlock({ section, palette, design }: BlockProps) {
  const fields = asObjectList(section.items);
  const variant = section.variant.toLowerCase();
  const wrapperClass =
    variant === "compact_form" ? "grid gap-2 sm:grid-cols-2" : "grid gap-3 sm:grid-cols-2";

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
        {fields.map((field, index) => (
          <label key={index} className="text-sm font-medium">
            {stringifyJsonValue(field.field ?? `Field ${index + 1}`)}
            <input className="mt-1 w-full rounded-xl border bg-white p-3 text-sm" style={{ borderColor: `${palette.primary}33` }} readOnly />
          </label>
        ))}
      </div>
      {variant === "whatsapp_first" ? (
        <div className="mt-3 rounded-xl border bg-white/80 p-3 text-sm" style={{ borderColor: `${palette.accent}55` }}>
          Flujo recomendado: botón WhatsApp visible antes del formulario para respuesta inmediata.
        </div>
      ) : null}
      {variant === "calendar_style_mock" ? (
        <div className="mt-3 grid grid-cols-7 gap-1 rounded-xl border bg-white/80 p-3 text-xs" style={{ borderColor: `${palette.primary}22` }}>
          {["L", "M", "X", "J", "V", "S", "D"].map((day) => (
            <span key={day} className="text-center font-semibold">{day}</span>
          ))}
          {Array.from({ length: 14 }).map((_, index) => (
            <span key={index} className="rounded-md border border-slate-200 py-1 text-center">{index + 1}</span>
          ))}
        </div>
      ) : null}
    </BlockContainer>
  );
}
