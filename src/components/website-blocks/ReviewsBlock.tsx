import { BlockContainer, type BlockProps, asObjectList, stringifyJsonValue } from "./block-utils";

export function ReviewsBlock({ section, palette }: BlockProps) {
  const reviews = asObjectList(section.items);

  return (
    <BlockContainer title={section.title} subtitle={section.subtitle} palette={palette} variant={section.variant} cta={section.cta}>
      <div className="grid gap-3 md:grid-cols-2">
        {reviews.map((review, index) => (
          <article key={index} className="rounded-2xl border bg-white/80 p-4" style={{ borderColor: `${palette.primary}22` }}>
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
