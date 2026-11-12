import { Analytics as VercelAnalytics } from "@vercel/analytics/next";

/**
 * The one analytics wrapper (ARCH-8). Vercel Analytics is imported here and
 * nowhere else. The package entry is its own client boundary, so this file
 * stays a server component and adds none. It renders nothing visible.
 */
export function Analytics() {
  return <VercelAnalytics />;
}
