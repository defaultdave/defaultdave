import { describe, expect, it } from "vitest";

import robots from "./robots";
import sitemap from "./sitemap";

describe("admin exclusion", () => {
  it("robots disallows /keystatic and /api/keystatic", () => {
    const { rules } = robots();
    const disallow = (Array.isArray(rules) ? rules[0] : rules)?.disallow;
    expect(disallow).toEqual(
      expect.arrayContaining(["/keystatic", "/api/keystatic"]),
    );
  });

  it("the sitemap lists no admin URL", () => {
    const urls = sitemap().map((entry) => entry.url);
    expect(urls.length).toBeGreaterThan(0);
    expect(urls.filter((u) => u.includes("keystatic"))).toEqual([]);
  });
});
