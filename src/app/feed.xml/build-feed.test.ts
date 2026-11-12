import { describe, expect, it } from "vitest";

import { buildFeed, escapeXml, toRfc822, type FeedPost } from "./build-feed";

const body = (() => null) as unknown as FeedPost["body"];

function post(over: Partial<FeedPost> & Pick<FeedPost, "slug">): FeedPost {
  return {
    collection: "articles",
    title: "A title",
    summary: "A summary.",
    publishedAt: "2026-01-01",
    body,
    ...over,
  };
}

const links = (xml: string) =>
  [...xml.matchAll(/<item>[\s\S]*?<link>(.*?)<\/link>/g)].map((m) => m[1]);

describe("escapeXml", () => {
  it.each([
    ["a & b", "a &amp; b"],
    ["<b>", "&lt;b&gt;"],
    [`"q" 'q'`, "&quot;q&quot; &apos;q&apos;"],
    ["bell\u0007char", "bellchar"],
  ])("%j becomes %j", (input, expected) => {
    expect(escapeXml(input)).toBe(expected);
  });
});

describe("toRfc822", () => {
  it("formats an ISO date in UTC", () => {
    expect(toRfc822("2026-11-06")).toBe("Fri, 06 Nov 2026 00:00:00 GMT");
  });

  it("throws on an invalid date", () => {
    expect(() => toRfc822("nope")).toThrow(/Invalid publishedAt/);
  });
});

describe("buildFeed", () => {
  it("declares RSS 2.0 with a self link and absolute channel link", () => {
    const xml = buildFeed([post({ slug: "a" })]);
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
    expect(xml).toContain('<rss version="2.0"');
    expect(xml).toContain("<link>https://davidfleming.me/</link>");
    expect(xml).toContain('href="https://davidfleming.me/feed.xml"');
  });

  it("orders articles and musings together, newest first", () => {
    const xml = buildFeed([
      post({ slug: "old", publishedAt: "2025-01-01" }),
      post({ slug: "new", collection: "musings", publishedAt: "2026-05-01" }),
      post({ slug: "mid", publishedAt: "2025-06-01" }),
    ]);
    expect(links(xml)).toEqual([
      "https://davidfleming.me/musings/new",
      "https://davidfleming.me/articles/mid",
      "https://davidfleming.me/articles/old",
    ]);
    expect(xml).toContain("<lastBuildDate>Fri, 01 May 2026");
  });

  it("links a canonical post to the original and keeps the site URL as guid", () => {
    const xml = buildFeed([
      post({
        slug: "elsewhere",
        canonical: {
          url: "https://www.linkedin.com/pulse/x?a=1&b=2",
          host: "www.linkedin.com",
        },
      }),
    ]);
    expect(links(xml)).toEqual([
      "https://www.linkedin.com/pulse/x?a=1&amp;b=2",
    ]);
    expect(xml).toContain(
      '<guid isPermaLink="true">https://davidfleming.me/articles/elsewhere</guid>',
    );
  });

  it("escapes title and summary", () => {
    const xml = buildFeed([
      post({ slug: "a", title: "Tom & <Jerry>", summary: `5 > 3 & "yes"` }),
    ]);
    expect(xml).toContain("<title>Tom &amp; &lt;Jerry&gt;</title>");
    expect(xml).toContain(
      "<description>5 &gt; 3 &amp; &quot;yes&quot;</description>",
    );
  });

  it("produces a valid empty channel with no posts", () => {
    const xml = buildFeed([]);
    expect(xml).not.toContain("<item>");
    expect(xml).not.toContain("lastBuildDate");
    expect(xml).toContain("</channel>");
  });

  it("is well-formed: every opening tag closes", () => {
    const xml = buildFeed([post({ slug: "a" }), post({ slug: "b" })]);
    const tags = [...xml.matchAll(/<(\/?)([a-zA-Z:]+)[^>]*?(\/?)>/g)];
    const stack: string[] = [];
    for (const [, close, name, self] of tags) {
      if (self) continue;
      if (close) expect(stack.pop()).toBe(name);
      else stack.push(name ?? "");
    }
    expect(stack).toEqual([]);
  });
});
