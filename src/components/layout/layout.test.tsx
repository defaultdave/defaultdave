import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { Footer } from "./Footer";
import { Nav } from "./Nav";
import { isCurrent, NAV_ITEMS } from "./nav-items";
import { RequestedPath } from "./RequestedPath";
import { Shell } from "./Shell";
import { Wordmark } from "./Wordmark";

describe("isCurrent", () => {
  it.each([
    ["/", "/", true],
    ["/work", "/", false],
    ["/work", "/work", true],
    ["/work/checkout", "/work", true],
    ["/workshop", "/work", false],
    ["/music", "/musings", false],
    [null, "/", false],
  ] as const)("pathname %s, item %s -> %s", (pathname, href, expected) => {
    expect(isCurrent(pathname, href)).toBe(expected);
  });
});

describe("Nav", () => {
  it("lists six links in a labelled navigation landmark", () => {
    const html = renderToStaticMarkup(<Nav pathname={null} />);
    expect(html).toContain('<nav aria-label="Primary">');
    expect(html.match(/<a /g)).toHaveLength(NAV_ITEMS.length);
    expect(NAV_ITEMS).toHaveLength(6);
  });

  it("marks only the current section with aria-current=page", () => {
    const html = renderToStaticMarkup(<Nav pathname="/work/checkout" />);
    expect(html.match(/aria-current="page"/g)).toHaveLength(1);
    expect(html).toMatch(/aria-current="page"[^>]*>Work</);
  });

  it("marks nothing when no section matches", () => {
    expect(renderToStaticMarkup(<Nav pathname="/nowhere" />)).not.toContain(
      "aria-current",
    );
  });
});

describe("Nav, Musings", () => {
  it("gives only the Musings link the highlighter class", () => {
    const html = renderToStaticMarkup(<Nav pathname={null} />);
    const links = html.match(/<a [^>]*>[^<]*<\/a>/g) ?? [];
    const playful = links.filter((link) => link.includes("musings"));
    expect(playful).toHaveLength(1);
    expect(playful[0]).toContain('href="/musings"');
    expect(playful[0]).toContain(">Musings<");
  });
});

describe("Wordmark", () => {
  const html = renderToStaticMarkup(<Wordmark />);

  it("links home with an accessible name", () => {
    expect(html).toContain('href="/"');
    expect(html).toContain('aria-label="DefaultDave, home"');
  });

  it("is plain text plus a decorative cursor, with no per-letter spans", () => {
    expect(html).toContain("DefaultDave");
    expect(html).toMatch(/<span[^>]*aria-hidden="true"><\/span>/);
    expect(html.match(/<span/g)).toHaveLength(1);
    expect(html).not.toContain("data-colour");
  });
});

describe("RequestedPath", () => {
  it("renders nothing on the server, where the requested path is unknown", () => {
    expect(renderToStaticMarkup(<RequestedPath />)).toBe("");
  });
});

describe("Footer", () => {
  it("is a footer landmark with email, LinkedIn and GitHub links", () => {
    const html = renderToStaticMarkup(<Footer />);
    expect(html).toMatch(/^<footer/);
    expect(html).toContain('href="mailto:');
    expect(html).toContain("linkedin.com");
    expect(html).toContain("github.com");
  });

  it("says all settings are left at default, with a link to restore them", () => {
    const html = renderToStaticMarkup(<Footer />);
    expect(html).toContain("All settings left at default.");
    expect(html).toMatch(/<a href="\/">Restore defaults<\/a>/);
  });

  it("carries the bar-room line right after that sentence, hidden by default", () => {
    const html = renderToStaticMarkup(<Footer />);
    expect(html).toContain(
      'All settings left at default.<span data-room-only="bar"> Except this room.</span> <a',
    );
  });
});

describe("Shell", () => {
  const html = renderToStaticMarkup(
    <Shell>
      <h1>Page</h1>
    </Shell>,
  );

  it("puts the skip link first, pointing at the main landmark", () => {
    expect(html).toMatch(/^<div[^>]*><a href="#main"/);
    expect(html).toContain('id="main"');
  });

  it("renders header, nav, main and footer landmarks in order", () => {
    const order = ["<header", "<nav", "<main", "<footer"].map((tag) =>
      html.indexOf(tag),
    );
    expect(order.every((index) => index >= 0)).toBe(true);
    expect(order).toEqual([...order].sort((a, b) => a - b));
    expect(html).toContain("<h1>Page</h1>");
  });
});
