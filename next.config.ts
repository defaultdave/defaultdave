import bundleAnalyzer from "@next/bundle-analyzer";
import type { NextConfig } from "next";

// `pnpm analyze` sets ANALYZE=true; the normal build is untouched.
const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

const isDev = process.env.NODE_ENV !== "production";

/** Each embed host's frame origins; mirrors the domains in embed-facade/hosts.ts. */
const EMBED_FRAME_ORIGINS = [
  "bandcamp.com",
  "soundcloud.com",
  "spotify.com",
  "youtube.com",
  "youtube-nocookie.com",
].flatMap((domain) => [`https://${domain}`, `https://*.${domain}`]);

/**
 * SEC-10: report-only until the policy has run clean. Vercel Analytics and
 * Speed Insights load from /_vercel/insights on the same origin, so 'self'
 * covers them. Next's inline hydration scripts need 'unsafe-inline' while
 * pages stay static (no per-request nonce); dev also needs 'unsafe-eval'.
 */
const contentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  "connect-src 'self'",
  `frame-src ${EMBED_FRAME_ORIGINS.join(" ")}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'self'",
].join("; ");

const nextConfig: NextConfig = {
  reactCompiler: true,
  typedRoutes: true,
  // Keystatic's route handler normalizes localhost to 127.0.0.1; without this
  // Next 16 blocks the dev resources and /keystatic renders blank.
  allowedDevOrigins: ["127.0.0.1"],
  // keystatic.config.ts also runs in the browser (the admin UI), where Next
  // does not expose VERCEL. Inline the storage kind so server and client agree.
  env: {
    KEYSTATIC_STORAGE_KIND: process.env.VERCEL ? "github" : "local",
  },
  headers() {
    return Promise.resolve([
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy-Report-Only",
            value: contentSecurityPolicy,
          },
        ],
      },
    ]);
  },
};

export default withBundleAnalyzer(nextConfig);
