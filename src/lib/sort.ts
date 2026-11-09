/** Compare two strings by code unit, so ties break the same way everywhere. */
function byText(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Featured entries first, then ascending `order`, then slug. */
export function sortWork<
  T extends { featured: boolean; order: number; slug: string },
>(entries: readonly T[]): T[] {
  return entries.toSorted(
    (a, b) =>
      Number(b.featured) - Number(a.featured) ||
      a.order - b.order ||
      byText(a.slug, b.slug),
  );
}

/** Newest `publishedAt` (ISO date) first, then slug. */
export function sortPostsNewestFirst<
  T extends { publishedAt: string; slug: string },
>(posts: readonly T[]): T[] {
  return posts.toSorted(
    (a, b) => byText(b.publishedAt, a.publishedAt) || byText(a.slug, b.slug),
  );
}

/** Newest year first, then title. */
export function sortReleasesNewestFirst<
  T extends { year: number; title: string },
>(releases: readonly T[]): T[] {
  return releases.toSorted(
    (a, b) => b.year - a.year || byText(a.title, b.title),
  );
}
