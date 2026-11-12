import { describe, expect, it } from "vitest";

import { formatDate } from "./format-date";

describe("formatDate", () => {
  it.each([
    ["2026-01-05", "Jan 5, 2026"],
    ["2026-12-31", "Dec 31, 2026"],
    ["2024-02-29", "Feb 29, 2024"],
  ])("formats %s as %s", (iso, expected) => {
    expect(formatDate(iso)).toBe(expected);
  });

  it.each([
    ["empty", ""],
    ["wrong shape", "01/05/2026"],
    ["timestamp", "2026-01-05T10:00:00Z"],
    ["impossible month", "2026-13-01"],
    ["impossible day", "2026-02-30"],
    ["non-leap Feb 29", "2025-02-29"],
  ])("rejects %s", (_name, iso) => {
    expect(() => formatDate(iso)).toThrow();
  });
});
