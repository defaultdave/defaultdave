import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { compileMdx } from "../../../content/mdx";
import type { About } from "../../../content/types";
import { AboutContent } from "./AboutContent";
import { AboutLinks } from "./AboutLinks";
import { linkTarget } from "../../../lib/link-target";

async function about(overrides: Partial<About> = {}): Promise<About> {
  return { bio: await compileMdx("Hello **there**."), links: [], ...overrides };
}

describe("linkTarget", () => {
  it.each([
    ["https://github.com/defaultdave", "_blank"],
    ["http://example.com", "_blank"],
    ["mailto:a@example.com", undefined],
    ["/work", undefined],
    ["#top", undefined],
  ])("%s -> %s", (href, expected) => {
    expect(linkTarget(href)).toBe(expected);
  });
});

describe("AboutLinks", () => {
  it("marks a new-tab link with rel noopener and the hidden notice", () => {
    const html = renderToStaticMarkup(
      <AboutLinks
        links={[{ label: "GitHub", href: "https://github.com/x" }]}
      />,
    );
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener"');
    expect(html).toContain("(opens in new tab)");
  });

  it("adds no target, rel or notice to a same-tab link", () => {
    const html = renderToStaticMarkup(
      <AboutLinks links={[{ label: "Email", href: "mailto:a@example.com" }]} />,
    );
    expect(html).not.toContain("target=");
    expect(html).not.toContain("rel=");
    expect(html).not.toContain("opens in new tab");
  });

  it("renders nothing for an empty list", () => {
    expect(renderToStaticMarkup(<AboutLinks links={[]} />)).toBe("");
  });
});

describe("AboutContent", () => {
  it("renders the bio and the links", async () => {
    const html = renderToStaticMarkup(
      <AboutContent
        about={await about({
          links: [{ label: "GitHub", href: "https://github.com/x" }],
        })}
      />,
    );
    expect(html).toContain("<strong>there</strong>");
    expect(html).toContain(">GitHub");
  });

  it("renders the headshot with its alt text and flags the two-column layout", async () => {
    const html = renderToStaticMarkup(
      <AboutContent
        about={await about({
          headshot: { src: "/images/about/me.jpg", alt: "Dave at a desk" },
        })}
      />,
    );
    expect(html).toContain("<img");
    expect(html).toContain('alt="Dave at a desk"');
    expect(html).toContain("data-has-headshot");
  });

  it("is text-only without a headshot: no image, no layout flag", async () => {
    const html = renderToStaticMarkup(<AboutContent about={await about()} />);
    expect(html).not.toContain("<img");
    expect(html).not.toContain("data-has-headshot");
  });
});
