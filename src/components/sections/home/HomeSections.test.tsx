import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import type { MDXContent, WorkEntry } from "../../../content/types";
import { HomeSections } from "./HomeSections";

const intro: MDXContent = () => <p>Intro paragraph.</p>;

function work(slug: string, title: string): WorkEntry {
  return {
    slug,
    title,
    summary: `${title} summary`,
    role: "Lead",
    period: { from: "2024-01" },
    stack: ["React"],
    links: [],
    featured: true,
    order: 1,
    kind: "case-study",
  };
}

const render = (featuredWork: WorkEntry[]) =>
  renderToStaticMarkup(
    <HomeSections
      headline="Hello there"
      intro={intro}
      featuredWork={featuredWork}
    />,
  );

describe("HomeSections", () => {
  it("renders the headline as the only h1, with the intro", () => {
    const html = render([work("a", "Alpha")]);
    expect(html.match(/<h1[ >]/g)).toHaveLength(1);
    expect(html).toMatch(/<h1[^>]*>Hello there<\/h1>/);
    expect(html).toContain("Intro paragraph.");
  });

  it("renders featured work in the order given, linking to each entry", () => {
    const html = render([work("b", "Beta"), work("a", "Alpha")]);
    expect(html.indexOf("Beta")).toBeLessThan(html.indexOf("Alpha"));
    expect(html).toContain('href="/work/b"');
    expect(html).toContain('href="/work/a"');
  });

  it("omits the featured block when there is no featured work", () => {
    const html = render([]);
    expect(html).not.toContain("Featured work");
    expect(html).toContain("Explore");
  });

  it.each([
    ["Work", "/work"],
    ["Articles", "/articles"],
    ["Musings", "/musings"],
    ["Music", "/music"],
    ["About", "/about"],
  ])("renders a %s card linking to %s", (title, href) => {
    const html = render([]);
    expect(html).toMatch(new RegExp(`<h3[^>]*>${title}</h3>`));
    expect(html).toContain(`href="${href}"`);
  });
});
