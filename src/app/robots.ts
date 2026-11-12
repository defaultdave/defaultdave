import type { MetadataRoute } from "next";

import { SITE_URL } from "../lib/metadata";

/** Hides the admin and its API route from crawlers and points them at the sitemap. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/keystatic", "/api/keystatic"],
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
