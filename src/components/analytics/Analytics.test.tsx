import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const vercelAnalytics = vi.hoisted(() => vi.fn(() => null));
const speedInsights = vi.hoisted(() => vi.fn(() => null));

vi.mock("@vercel/analytics/next", () => ({ Analytics: vercelAnalytics }));
vi.mock("@vercel/speed-insights/next", () => ({
  SpeedInsights: speedInsights,
}));

import { Analytics } from "./Analytics";

describe("Analytics", () => {
  it("renders Vercel Analytics and Speed Insights once each and no markup", () => {
    const html = renderToStaticMarkup(<Analytics />);
    expect(vercelAnalytics).toHaveBeenCalledTimes(1);
    expect(speedInsights).toHaveBeenCalledTimes(1);
    expect(html).toBe("");
  });
});
