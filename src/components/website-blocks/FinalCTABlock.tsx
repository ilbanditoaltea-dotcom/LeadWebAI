import type { BlockProps } from "./block-utils";
import { BlockContainer } from "./block-utils";

export function FinalCTABlock({ section, palette }: BlockProps) {
  return (
    <BlockContainer title={section.title} subtitle={section.subtitle} palette={palette} variant={section.variant}>
      <div className="rounded-2xl p-6 text-center" style={{ backgroundColor: `${palette.primary}15` }}>
        <p className="mb-4 text-sm opacity-80">Ready to take the next step?</p>
        <button
          type="button"
          className="rounded-xl px-6 py-3 text-sm font-semibold text-white"
          style={{ backgroundColor: palette.primary }}
        >
          {section.cta}
        </button>
      </div>
    </BlockContainer>
  );
}
