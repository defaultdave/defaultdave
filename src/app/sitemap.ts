import type { MetadataRoute } from "next";

import { listPosts, listWork } from "../content";
import { SITE_URL } from "../lib/metadata";

const STATIC_ROUTES = [
  "/",
  "/work",
  "/articles",
  "/musings",
  "/music",
  "/about",
];

/**
 * Every public route. It names only public URLs, so /keystatic, /api/* and
 * /tokens are excluded by construction. Cards have no page, so only case
 * studies appear under /work.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [work, articles, musings] = await Promise.all([
    listWork(),
    listPosts("articles"),
    listPosts("musings"),
  ]);
  return [
    ...STATIC_ROUTES.map((path) => ({ url: `${SITE_URL}${path}` })),
    ...work
      .filter((e) => e.kind === "case-study")
      .map((e) => ({ url: `${SITE_URL}/work/${e.slug}` })),
    ...articles.map((p) => ({
      url: `${SITE_URL}/articles/${p.slug}`,
      lastModified: p.updatedAt ?? p.publishedAt,
    })),
    ...musings.map((p) => ({
      url: `${SITE_URL}/musings/${p.slug}`,
      lastModified: p.updatedAt ?? p.publishedAt,
    })),
  ];
}
