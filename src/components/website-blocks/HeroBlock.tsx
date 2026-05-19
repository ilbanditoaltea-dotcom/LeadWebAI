import type { WebsiteColorPalette } from "@/src/lib/types/ai-website";
import { ImagePromptPlaceholder } from "./block-utils";

type HeroBlockProps = {
  website: {
    businessProfile: {
      businessName: string;
      visualStyle: string;
      colorPalette: WebsiteColorPalette;
    };
    website: {
      hero: {
        variant: string;
        eyebrow: string;
        title: string;
        subtitle: string;
        primaryCTA: string;
        secondaryCTA: string;
        backgroundImagePrompt: string;
      };
    };
  };
};

export function HeroBlock({ website }: HeroBlockProps) {
  const { businessProfile, website: site } = website;
  const { colorPalette: palette } = businessProfile;
  const heroVariant = site.hero.variant.toLowerCase();
  const visualStyle = website.businessProfile.visualStyle;
  const isDarkStyle = ["premium_dark", "vintage", "industrial", "vintage_barbershop", "industrial_automotive"].includes(visualStyle);
  const containerClass =
    heroVariant === "split_image" || heroVariant.includes("split")
      ? "grid gap-8 md:grid-cols-[1.1fr_0.9fr] md:items-center"
      : heroVariant === "centered_editorial" || heroVariant === "magazine_style"
        ? "text-center"
        : "space-y-2";

  return (
    <section
      className="relative overflow-hidden rounded-[2rem] border p-8 shadow-sm md:p-12"
      style={{
        borderColor: `${palette.primary}44`,
        background: isDarkStyle
          ? `radial-gradient(circle at top right, ${palette.accent}35, transparent 45%), linear-gradient(145deg, ${palette.background}, ${palette.primary}20)`
          : `radial-gradient(circle at top right, ${palette.secondary}30, transparent 45%), linear-gradient(135deg, ${palette.background}, ${palette.secondary}18)`,
      }}
    >
      <div className={containerClass}>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.15em]" style={{ color: palette.primary }}>
            {site.hero.eyebrow}
          </p>
          <h1 className="mt-3 max-w-3xl text-4xl font-bold tracking-tight md:text-5xl">{site.hero.title}</h1>
          <p className="mt-4 max-w-2xl text-base opacity-80 md:text-lg">{site.hero.subtitle}</p>
          <div
            className={`mt-6 flex flex-wrap gap-3 ${
              heroVariant === "centered_editorial" || heroVariant === "magazine_style"
                ? "justify-center"
                : "justify-start"
            }`}
          >
            <button
              type="button"
              className="rounded-xl px-5 py-3 text-sm font-semibold text-white"
              style={{
                background: `linear-gradient(90deg, ${palette.primary}, ${palette.accent})`,
              }}
            >
              {site.hero.primaryCTA}
            </button>
            <button
              type="button"
              className="rounded-xl border px-5 py-3 text-sm font-semibold"
              style={{ borderColor: `${palette.primary}66`, color: palette.primary }}
            >
              {site.hero.secondaryCTA}
            </button>
          </div>
        </div>
        <div className={heroVariant === "split_image" ? "md:pl-4" : ""}>
          <ImagePromptPlaceholder
            prompt={site.hero.backgroundImagePrompt}
            alt={`${businessProfile.businessName} hero visual`}
            palette={palette}
          />
        </div>
      </div>
    </section>
  );
}
