import { describe, expect, it, vi } from "vitest";

vi.mock("../content", () => ({
  listWork: () =>
    Promise.resolve([
      { slug: "study", kind: "case-study" },
      { slug: "card", kind: "card" },
    ]),
  listPosts: (collection: string) =>
    Promise.resolve(
      collection === "articles"
        ? [{ slug: "a1", publishedAt: "2026-01-01", updatedAt: "2026-02-01" }]
        : [{ slug: "m1", publishedAt: "2026-03-01" }],
    ),
}));

import sitemap from "./sitemap";

describe("sitemap", () => {
  it("lists every static route and each detail page on the production origin", async () => {
    const urls = (await sitemap()).map((e) => e.url);
    expect(urls).toEqual([
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

  it("leaves out work cards, which have no page", async () => {
    const urls = (await sitemap()).map((e) => e.url);
    expect(urls).not.toContain("https://davidfleming.me/work/card");
  });

  it("dates posts by updatedAt, falling back to publishedAt", async () => {
    const entries = await sitemap();
    const dates = Object.fromEntries(
      entries.map((e) => [e.url, e.lastModified]),
    );
    expect(dates["https://davidfleming.me/articles/a1"]).toBe("2026-02-01");
    expect(dates["https://davidfleming.me/musings/m1"]).toBe("2026-03-01");
  });

  it.each(["/keystatic", "/api", "/tokens"])("never lists %s", async (path) => {
    const urls = (await sitemap()).map((e) => new URL(e.url).pathname);
    expect(urls.filter((p) => p.startsWith(path))).toEqual([]);
  });
});
