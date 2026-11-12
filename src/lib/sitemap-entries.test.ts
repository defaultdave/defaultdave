import { describe, expect, it } from "vitest";

import { buildSitemapEntries, siteUrl } from "./sitemap-entries";

const content = {
  work: [
    { slug: "study", kind: "case-study" },
    { slug: "card", kind: "card" },
  ],
  articles: [
    { slug: "a1", publishedAt: "2026-01-01", updatedAt: "2026-02-01" },
  ],
  musings: [{ slug: "m1", publishedAt: "2026-03-01" }],
};

describe("siteUrl", () => {
  it("joins a path to the production origin", () => {
    expect(siteUrl("/work")).toBe("https://davidfleming.me/work");
  });
});

describe("buildSitemapEntries", () => {
  it("lists static routes, then work, articles and musings, in order", () => {
    expect(buildSitemapEntries(content).map((e) => e.url)).toEqual([
      "https://davidfleming.me/",
      "https://davidfleming.me/work",
      "https://davidfleming.me/articles",
      "https://davidfleming.me/musings",
      "https://davidfleming.me/music",
      "https://davidfleming.me/about",
      "https://davidfleming.me/work/study",
      "https://davidfleming.me/articles/a1",
      "https://davidfleming.me/musings/m1",
    ]);
  });

  it("leaves out work cards, which have no page", () => {
    const urls = buildSitemapEntries(content).map((e) => e.url);
    expect(urls).not.toContain("https://davidfleming.me/work/card");
  });

  it("dates posts by updatedAt, falling back to publishedAt", () => {
    const dates = Object.fromEntries(
      buildSitemapEntries(content).map((e) => [e.url, e.lastModified]),
    );
    expect(dates["https://davidfleming.me/articles/a1"]).toBe("2026-02-01");
    expect(dates["https://davidfleming.me/musings/m1"]).toBe("2026-03-01");
  });

  it("gives static and work routes no lastModified", () => {
    const [home] = buildSitemapEntries(content);
    expect(home).toEqual({ url: "https://davidfleming.me/" });
  });

  it.each(["/keystatic", "/api", "/tokens"])("never lists %s", (path) => {
    const paths = buildSitemapEntries(content).map(
      (e) => new URL(e.url).pathname,
    );
    expect(paths.filter((p) => p.startsWith(path))).toEqual([]);
  });
});
