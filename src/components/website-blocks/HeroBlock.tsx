import type { GeneratedWebsite } from "@/src/lib/types/ai-website";
import { ImagePromptPlaceholder } from "./block-utils";

type HeroBlockProps = {
  website: GeneratedWebsite;
};

export function HeroBlock({ website }: HeroBlockProps) {
  const { businessProfile, website: site } = website;
  const { colorPalette: palette } = businessProfile;

  return (
    <section
      className="relative overflow-hidden rounded-[2rem] border p-8 shadow-sm md:p-12"
      style={{
        borderColor: `${palette.primary}33`,
        background: `linear-gradient(135deg, ${palette.background}, ${palette.secondary}22)`,
      }}
    >
      <p className="text-sm font-semibold uppercase tracking-[0.15em]" style={{ color: palette.primary }}>
        {site.hero.eyebrow}
      </p>
      <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight md:text-5xl">{site.hero.title}</h1>
      <p className="mt-4 max-w-2xl text-base opacity-80 md:text-lg">{site.hero.subtitle}</p>
      <div className="mt-6 flex flex-wrap gap-3">
        <button
          type="button"
          className="rounded-xl px-5 py-3 text-sm font-semibold text-white"
          style={{ backgroundColor: palette.primary }}
        >
          {site.hero.primaryCTA}
        </button>
        <button
          type="button"
          className="rounded-xl border px-5 py-3 text-sm font-semibold"
          style={{ borderColor: `${palette.primary}55`, color: palette.primary }}
        >
          {site.hero.secondaryCTA}
        </button>
      </div>
      <div className="mt-6">
        <ImagePromptPlaceholder
          prompt={site.hero.backgroundImagePrompt}
          alt={`${businessProfile.businessName} hero visual`}
          palette={palette}
        />
      </div>
    </section>
  );
}
