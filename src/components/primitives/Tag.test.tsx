import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Tag } from "./Tag";

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
