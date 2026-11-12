import { Analytics as VercelAnalytics } from "@vercel/analytics/next";
import { SpeedInsights as VercelSpeedInsights } from "@vercel/speed-insights/next";

/**
 * The one analytics wrapper (ARCH-8). Vercel Analytics and Speed Insights are
 * imported here and nowhere else. Each package entry is its own client
 * boundary, so this file stays a server component and adds none. It renders
 * nothing visible.
 */
export function Analytics() {
  return (
    <>
      <VercelAnalytics />
      <VercelSpeedInsights />
    </>
  );
}
