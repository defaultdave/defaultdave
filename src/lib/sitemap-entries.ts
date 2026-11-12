import { SITE_URL } from "./metadata";
import { caseStudies } from "./work-kind";

const STATIC_ROUTES = [
  "/",
  "/work",
  "/articles",
  "/musings",
  "/music",
  "/about",
];

type SitemapEntry = { url: string; lastModified?: string };
type Post = { slug: string; publishedAt: string; updatedAt?: string };

/** Absolute URL for a route path on the production origin. */
export function siteUrl(path: string): string {
  return `${SITE_URL}${path}`;
}

function postEntries(
  collection: "articles" | "musings",
  posts: readonly Post[],
): SitemapEntry[] {
  return posts.map((p) => ({
    url: siteUrl(`/${collection}/${p.slug}`),
    lastModified: p.updatedAt ?? p.publishedAt,
  }));
}

/**
 * Every public route. It names only public URLs, so /keystatic, /api/* and
 * /tokens are excluded by construction. Cards have no page, so only case
 * studies appear under /work. Posts are dated by updatedAt, else publishedAt.
 */
export function buildSitemapEntries(content: {
  work: readonly { slug: string; kind: string }[];
  articles: readonly Post[];
  musings: readonly Post[];
}): SitemapEntry[] {
  return [
    ...STATIC_ROUTES.map((path) => ({ url: siteUrl(path) })),
    ...caseStudies(content.work).map((e) => ({
      url: siteUrl(`/work/${e.slug}`),
    })),
    ...postEntries("articles", content.articles),
    ...postEntries("musings", content.musings),
  ];
}
