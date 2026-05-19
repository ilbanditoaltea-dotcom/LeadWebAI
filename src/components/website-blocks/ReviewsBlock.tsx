import { BlockContainer, type BlockProps, asObjectList, stringifyJsonValue } from "./block-utils";

export function ReviewsBlock({ section, palette, design }: BlockProps) {
  const reviews = asObjectList(section.items);
  const variant = section.variant.toLowerCase();
  const gridClass = variant === "quote_wall" ? "columns-1 gap-3 md:columns-2" : "grid gap-3 md:grid-cols-2";
  const averageRating =
    reviews.length > 0
      ? (
          reviews
            .map((item) =>
              typeof item.rating === "number" ? item.rating : Number(stringifyJsonValue(item.rating ?? 0)),
            )
            .filter((value) => Number.isFinite(value) && value > 0)
            .reduce((acc, value) => acc + value, 0) /
          Math.max(
            1,
            reviews.filter((item) =>
              Number.isFinite(
                typeof item.rating === "number" ? item.rating : Number(stringifyJsonValue(item.rating ?? 0)),
              ),
            ).length,
          )
        ).toFixed(1)
      : null;

  return (
    <BlockContainer
      title={section.title}
      subtitle={section.subtitle}
      palette={palette}
      variant={section.variant}
      cta={section.cta}
      design={design}
    >
      {variant === "rating_summary" && averageRating ? (
        <article className="mb-3 rounded-2xl border bg-white/80 p-4" style={{ borderColor: `${palette.primary}22` }}>
          <p className="text-sm opacity-80">Valoración media</p>
          <p className="text-2xl font-bold" style={{ color: palette.primary }}>
            {averageRating} / 5
          </p>
        </article>
      ) : null}
      <div className={gridClass}>
        {reviews.map((review, index) => (
          <article
            key={index}
            className={`rounded-2xl border bg-white/80 p-4 ${variant === "quote_wall" ? "mb-3 break-inside-avoid" : ""}`}
            style={{ borderColor: `${palette.primary}22` }}
          >
            <p className="font-medium">
              &quot;{stringifyJsonValue(review.text ?? review.comment ?? review.review ?? "")}&quot;
            </p>
            <p className="mt-2 text-sm opacity-80">{stringifyJsonValue(review.author ?? "Anonymous")}</p>
          </article>
        ))}
      </div>
    </BlockContainer>
  );
}
