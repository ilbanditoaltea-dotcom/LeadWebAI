import { BlockContainer, type BlockProps, asObjectList, stringifyJsonValue } from "./block-utils";

export function InstagramBlock({ section, palette }: BlockProps) {
  const posts = asObjectList(section.items);

  return (
    <BlockContainer title={section.title} subtitle={section.subtitle} palette={palette} variant={section.variant} cta={section.cta}>
      <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
        {posts.map((post, index) => (
          <article key={index} className="rounded-2xl border p-3" style={{ borderColor: `${palette.secondary}33`, backgroundColor: `${palette.background}` }}>
            <div className="aspect-square rounded-xl bg-white/80" />
            <p className="mt-2 text-xs opacity-80">{stringifyJsonValue(post.caption ?? `Post ${index + 1}`)}</p>
          </article>
        ))}
      </div>
    </BlockContainer>
  );
}
