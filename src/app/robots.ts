import type { MetadataRoute } from "next";

/**
 * Placeholder until the seo-perf unit: it disallows the admin and its API route
 * and leaves everything else open. seo-perf adds the sitemap pointer.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/keystatic", "/api/keystatic"],
    },
  };
}
