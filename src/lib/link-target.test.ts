import { describe, expect, it } from "vitest";

import { linkTarget } from "./link-target";

describe("linkTarget", () => {
  it.each([
    ["https://github.com/defaultdave", "_blank"],
    ["http://example.com", "_blank"],
    ["HTTPS://EXAMPLE.COM", "_blank"],
    ["mailto:a@example.com", undefined],
    ["/work", undefined],
    ["#top", undefined],
  ])("%s -> %s", (href, expected) => {
    expect(linkTarget(href)).toBe(expected);
  });
});
