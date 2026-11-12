import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

const vercelAnalytics = vi.hoisted(() => vi.fn(() => null));

vi.mock("@vercel/analytics/next", () => ({ Analytics: vercelAnalytics }));

import { Analytics } from "./Analytics";

describe("Analytics", () => {
  it("renders the Vercel Analytics component once and no markup", () => {
    const html = renderToStaticMarkup(<Analytics />);
    expect(vercelAnalytics).toHaveBeenCalledTimes(1);
    expect(html).toBe("");
  });
});
