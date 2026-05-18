import type { BlockProps } from "./block-utils";
import { BlockContainer } from "./block-utils";

export function LocationBlock({ section, palette }: BlockProps) {
  return (
    <BlockContainer title={section.title} subtitle={section.subtitle} palette={palette} variant={section.variant} cta={section.cta}>
      <div className="rounded-2xl border p-4" style={{ borderColor: `${palette.secondary}33` }}>
        <div className="mb-3 aspect-video rounded-xl" style={{ backgroundColor: `${palette.primary}15` }} />
        <p className="text-sm opacity-85">Embedded map area generated dynamically from business contact data.</p>
      </div>
    </BlockContainer>
  );
}
