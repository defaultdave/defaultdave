import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { compileMdx } from "../../../content/mdx";
import type { Post } from "../../../content/types";
import { PostList, type PostListItem } from "./PostList";
import { PostPage } from "./PostPage";

const item = (over: Partial<PostListItem> = {}): PostListItem => ({
  slug: "a",
  title: "Alpha",
  summary: "About alpha.",
  date: "Jan 5, 2026",
  isoDate: "2026-01-05",
  readingTime: "3 min read",
  ...over,
});

async function post(over: Partial<Post> = {}): Promise<Post> {
  return {
    slug: "a",
    title: "Alpha",
    summary: "About alpha.",
    publishedAt: "2026-01-05",
    body: await compileMdx("Body text here."),
    ...over,
  };
}

const page = async (over: Partial<Post> = {}, readingTime?: string) =>
  renderToStaticMarkup(
    <PostPage
      post={await post(over)}
      backPath="/articles"
      backLabel="Articles"
      {...(readingTime ? { readingTime } : {})}
    />,
  );

describe("PostList", () => {
  it("renders title, date, summary and reading time, in the order given", () => {
    const html = renderToStaticMarkup(
      <PostList
        basePath="/articles"
        posts={[item(), item({ slug: "b", title: "Beta" })]}
      />,
    );
    expect(html).toContain("Alpha");
    expect(html).toContain("Jan 5, 2026 · 3 min read");
    expect(html).toContain("About alpha.");
    expect(html).toContain('href="/articles/a"');
    expect(html.indexOf("Alpha")).toBeLessThan(html.indexOf("Beta"));
  });

  it("leaves reading time out when absent", () => {
    const withoutTime: PostListItem = {
      slug: "a",
      title: "Alpha",
      summary: "About alpha.",
      date: "Jan 5, 2026",
      isoDate: "2026-01-05",
    };
    const html = renderToStaticMarkup(
      <PostList basePath="/musings" posts={[withoutTime]} />,
    );
    expect(html).toContain("Jan 5, 2026<");
    expect(html).not.toContain("min read");
  });

  it("shows a one-line empty state", () => {
    const html = renderToStaticMarkup(
      <PostList basePath="/articles" posts={[]} />,
    );
    expect(html).toBe("<p>Nothing here yet.</p>");
  });
});

describe("PostPage", () => {
  it("renders the body and a back link for a post without canonical", async () => {
    const html = await page({}, "1 min read");
    expect(html).toContain("Body text here.");
    expect(html).toContain('href="/articles"');
    expect(html).toContain("Articles");
    expect(html).toContain('<time dateTime="2026-01-05">Jan 5, 2026</time>');
    expect(html).toContain("1 min read");
    expect(html).not.toContain("Read on");
  });

  it("renders summary and a Read on link for a canonical post, not the body", async () => {
    const html = await page({
      canonical: { url: "https://example.com/a", host: "example.com" },
    });
    expect(html).toContain("About alpha.");
    expect(html).toContain('href="https://example.com/a"');
    expect(html).toContain("Read on example.com");
    expect(html).not.toContain("Body text here.");
  });

  it("shows the updated date when present", async () => {
    const html = await page({ updatedAt: "2026-02-01" });
    expect(html).toContain("Updated");
    expect(html).toContain("Feb 1, 2026");
  });
});
