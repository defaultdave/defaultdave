import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  typedRoutes: true,
  // Keystatic's route handler normalizes localhost to 127.0.0.1; without this
  // Next 16 blocks the dev resources and /keystatic renders blank.
  allowedDevOrigins: ["127.0.0.1"],
};

export default nextConfig;
