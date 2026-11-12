import { describe, expect, it } from "vitest";

import { formatPeriod } from "./format-period";

describe("formatPeriod", () => {
  it.each([
    [{ from: "2026-04", to: "2026-08" }, "Apr 2026 to Aug 2026"],
    [{ from: "2023-12", to: "2024-01" }, "Dec 2023 to Jan 2024"],
    [{ from: "2026-09" }, "since Sep 2026"],
    [{ from: "2024-01" }, "since Jan 2024"],
  ])("formats %j as %s", (period, expected) => {
    expect(formatPeriod(period)).toBe(expected);
  });

  it.each([
    [{ from: "2026-13" }],
    [{ from: "2026-00" }],
    [{ from: "2026-4" }],
    [{ from: "2026-04-01" }],
    [{ from: "2026-04", to: "soon" }],
  ])("rejects %j", (period) => {
    expect(() => formatPeriod(period)).toThrow(/ISO month/);
  });
});
