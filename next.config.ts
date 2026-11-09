import type { NextConfig } from "next";

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
};

export default nextConfig;
