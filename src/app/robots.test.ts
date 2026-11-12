import { describe, expect, it } from "vitest";

import robots from "./robots";

describe("robots", () => {
  it("disallows /keystatic and /api/keystatic and allows the rest", () => {
    const { rules } = robots();
    const rule = Array.isArray(rules) ? rules[0] : rules;
    expect(rule?.allow).toBe("/");
    expect(rule?.disallow).toEqual(["/keystatic", "/api/keystatic"]);
  });

  it("points crawlers at the sitemap", () => {
    expect(robots().sitemap).toBe("https://davidfleming.me/sitemap.xml");
  });
});
