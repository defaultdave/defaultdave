import type { MetadataRoute } from "next";

import { listPosts, listWork } from "../content";
import { buildSitemapEntries } from "../lib/sitemap-entries";

/** Every public route; selection and dating live in `lib/sitemap-entries`. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [work, articles, musings] = await Promise.all([
    listWork(),
    listPosts("articles"),
    listPosts("musings"),
  ]);
  return buildSitemapEntries({ work, articles, musings });
}
