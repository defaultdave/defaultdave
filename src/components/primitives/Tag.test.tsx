import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Tag, popTone } from "./Tag";

describe("popTone", () => {
  it.each([
    [0, "pop-1"],
    [3, "pop-4"],
    [4, "pop-1"],
    [6, "pop-3"],
  ] as const)("index %i is %s, cycling every four", (index, expected) => {
    expect(popTone(index)).toBe(expected);
  });
});

describe("Tag", () => {
  it.each([
    [undefined, "neutral"],
    ["pop-2", "pop-2"],
  ] as const)(
    "tone %s renders data-tone=%s with its text",
    (tone, expected) => {
      const html = renderToStaticMarkup(
        <Tag {...(tone ? { tone } : {})}>Next.js</Tag>,
      );
      expect(html).toContain(`data-tone="${expected}"`);
      expect(html).toContain(">Next.js</span>");
    },
  );
});
