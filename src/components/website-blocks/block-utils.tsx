import type { ReactNode } from "react";
import type { JsonValue, WebsiteColorPalette, WebsiteSection } from "@/src/lib/types/ai-website";

export type BlockProps = {
  section: WebsiteSection;
  palette: WebsiteColorPalette;
};

type BlockContainerProps = {
  title: string;
  subtitle?: string;
  palette: WebsiteColorPalette;
  variant?: string;
  children: ReactNode;
  cta?: string;
};

function resolveVariantClasses(variant?: string) {
  if (!variant) {
    return "bg-white";
  }

  if (variant.includes("dark")) {
    return "bg-slate-900 text-white";
  }

  if (variant.includes("highlight") || variant.includes("banner")) {
    return "bg-violet-50";
  }

  if (variant.includes("compact")) {
    return "bg-slate-50";
  }

  return "bg-white";
}

export function BlockContainer({
  title,
  subtitle,
  palette,
  variant,
  children,
  cta,
}: BlockContainerProps) {
  return (
    <section
      className={`rounded-3xl border p-6 shadow-sm md:p-8 ${resolveVariantClasses(variant)}`}
      style={{ borderColor: `${palette.primary}22` }}
    >
      <header className="mb-5">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        {subtitle ? <p className="mt-2 text-sm opacity-80">{subtitle}</p> : null}
      </header>
      {children}
      {cta ? (
        <button
          type="button"
          className="mt-6 rounded-xl px-4 py-2 text-sm font-semibold text-white"
          style={{ backgroundColor: palette.primary }}
        >
          {cta}
        </button>
      ) : null}
    </section>
  );
}

export function asObjectList(items: JsonValue[]): Record<string, JsonValue>[] {
  return items.filter((item): item is Record<string, JsonValue> => {
    return typeof item === "object" && item !== null && !Array.isArray(item);
  });
}

export function stringifyJsonValue(value: JsonValue): string {
  if (value === null) {
    return "";
  }

  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }

  if (Array.isArray(value)) {
    return value.map((entry) => stringifyJsonValue(entry)).filter(Boolean).join(" - ");
  }

  return Object.values(value)
    .map((entry) => stringifyJsonValue(entry))
    .filter(Boolean)
    .join(" - ");
}

type ImagePromptPlaceholderProps = {
  prompt: string;
  alt: string;
  palette: WebsiteColorPalette;
  compact?: boolean;
};

export function ImagePromptPlaceholder({
  prompt,
  alt,
  palette,
  compact = false,
}: ImagePromptPlaceholderProps) {
  return (
    <article
      className={`rounded-2xl border p-4 ${
        compact ? "mb-3" : "mb-4"
      }`}
      style={{
        borderColor: `${palette.primary}22`,
        background: `linear-gradient(135deg, ${palette.secondary}18, ${palette.primary}10)`,
      }}
      aria-label={alt}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.18em] opacity-70">
        Visual IA sugerido
      </p>
      <p className="mt-2 text-sm">
        Imagen sugerida por IA: {prompt}
      </p>
      <button
        type="button"
        disabled
        title="Disponible en una próxima versión"
        className="mt-3 rounded-lg border border-slate-300 bg-white/80 px-3 py-1.5 text-xs font-semibold text-slate-500"
      >
        Generar imagen
      </button>
    </article>
  );
}
