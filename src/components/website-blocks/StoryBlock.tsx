import type { BlockProps } from "./block-utils";
import { BlockContainer, stringifyJsonValue } from "./block-utils";

export function StoryBlock({ section, palette }: BlockProps) {
  return (
    <BlockContainer title={section.title} subtitle={section.subtitle} palette={palette} variant={section.variant} cta={section.cta}>
      <div className="rounded-2xl border bg-white/70 p-5 text-sm leading-relaxed" style={{ borderColor: `${palette.secondary}33` }}>
        {section.items.length > 0
          ? section.items.map((item, index) => <p key={index} className={index > 0 ? "mt-3" : ""}>{stringifyJsonValue(item)}</p>)
          : <p>Business story content will be generated here.</p>}
      </div>
    </BlockContainer>
  );
}
