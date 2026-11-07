import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { LinkButton } from "./LinkButton";

describe("LinkButton", () => {
  it.each([
    "/work",
    "#main",
    "https://github.com/defaultdave",
    "mailto:a@example.com",
  ])("links to %s with the label as its text", (href) => {
    const html = renderToStaticMarkup(<LinkButton href={href}>Go</LinkButton>);
    expect(html).toMatch(/^<a /);
    expect(html).toContain(`href="${href}"`);
    expect(html).toContain(">Go</a>");
  });

  it("styles primary and secondary differently", () => {
    const primary = renderToStaticMarkup(
      <LinkButton href="/work">Go</LinkButton>,
    );
    const secondary = renderToStaticMarkup(
      <LinkButton href="/work" variant="secondary">
        Go
      </LinkButton>,
    );
    expect(primary).not.toBe(secondary);
  });
});
