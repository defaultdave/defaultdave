import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Stack } from "./Stack";

describe("Stack", () => {
  it("renders its children in a div with the default gap", () => {
    const html = renderToStaticMarkup(
      <Stack>
        <p>one</p>
        <p>two</p>
      </Stack>,
    );
    expect(html).toMatch(/^<div[^>]* data-gap="4"/);
    expect(html).toContain("<p>one</p><p>two</p>");
  });

  it("uses the element and gap it is given", () => {
    const html = renderToStaticMarkup(
      <Stack as="ul" gap={7}>
        <li>item</li>
      </Stack>,
    );
    expect(html).toMatch(/^<ul[^>]* data-gap="7"/);
  });
});
