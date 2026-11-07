import type { MetadataRoute } from "next";

/**
 * Placeholder until the seo-perf unit lists every public route. It names only
 * public URLs, so the admin is excluded by construction.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: "https://davidfleming.me/" }];
}
