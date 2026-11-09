import {
  cp,
  mkdtemp,
  readdir,
  readFile,
  rm,
  writeFile,
} from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import config from "../../keystatic.config";
import { createContent } from "./index";

const fixture = (name: string) =>
  join(import.meta.dirname, "__fixtures__", name);
const valid = createContent(fixture("valid"));

describe("content layer, valid tree", () => {
  it("getHome returns the headline, compiled intro and featured slugs", async () => {
    const home = await valid.getHome();
    expect(home.headline).toBe("Headline");
    expect(home.featuredWork).toEqual(["b-study"]);
    expect(typeof home.intro).toBe("function");
  });

  it("getAbout returns links and omits an unset headshot", async () => {
    const about = await valid.getAbout();
    expect(about.links).toEqual([
      { label: "Mail", href: "mailto:test@example.com" },
    ]);
    expect(about).not.toHaveProperty("headshot");
  });

  it("listWork sorts featured first, then order", async () => {
    const slugs = (await valid.listWork()).map((w) => w.slug);
    expect(slugs).toEqual(["c-featured-card", "a-card", "b-study"]);
  });

  it("a case study has body, cover, metrics and a period; a card has no body", async () => {
    const study = await valid.getWork("b-study");
    expect(study).toMatchObject({
      kind: "case-study",
      period: { from: "2024-01", to: "2024-06" },
      cover: { src: "/images/work/cover.png", alt: "A cover" },
      metrics: [{ label: "LCP", value: "1.2 s" }],
    });
    expect(study?.body).toBeTypeOf("function");
    expect(study?.metrics?.[0]).not.toHaveProperty("note");

    const card = await valid.getWork("a-card");
    expect(card).not.toHaveProperty("body");
    expect(card?.period).toEqual({ from: "2024-01" });
    expect(card).not.toHaveProperty("cover");
    expect(card).not.toHaveProperty("metrics");
  });

  it("getWork and getPost return null for an unknown slug", async () => {
    expect(await valid.getWork("nope")).toBeNull();
    expect(await valid.getPost("articles", "nope")).toBeNull();
  });

  it("listPosts is newest first and derives the canonical host", async () => {
    const posts = await valid.listPosts("articles");
    expect(posts.map((p) => p.slug)).toEqual(["new", "old"]);
    expect(posts[0]?.canonical).toEqual({
      url: "https://dev.example.org/post",
      host: "dev.example.org",
    });
    expect(posts[1]).not.toHaveProperty("canonical");
    expect(posts[1]).not.toHaveProperty("updatedAt");
  });

  it("musings share the post shape", async () => {
    const post = await valid.getPost("musings", "m1");
    expect(post).toMatchObject({ slug: "m1", publishedAt: "2025-05-05" });
  });

  it("listReleases is newest year first; empty notes are omitted", async () => {
    const releases = await valid.listReleases();
    expect(releases.map((r) => r.slug)).toEqual(["r2024", "r2020"]);
    expect(releases[0]?.notes).toBeTypeOf("function");
    expect(releases[1]).not.toHaveProperty("notes");
  });
});

describe("content layer, bad entries", () => {
  it("a malformed entry fails with the file path in the error", async () => {
    const bad = createContent(fixture("malformed"));
    await expect(bad.listWork()).rejects.toThrow(
      join(fixture("malformed"), "content/work/bad/index.mdx"),
    );
  });

  it("a body with raw HTML fails with the file path in the error", async () => {
    const bad = createContent(fixture("rawhtml"));
    await expect(bad.listPosts("articles")).rejects.toThrow(
      join(fixture("rawhtml"), "content/articles/bad/index.mdx"),
    );
  });
});

describe("slugs are separate from titles", () => {
  const collections = Object.entries(config.collections);

  it.each(collections)("%s: slugField is not the title field", (_name, c) => {
    expect(c.slugField).toBe("slug");
    const schema = c.schema as Record<string, unknown>;
    expect(schema.title).toBeDefined();
    expect(schema.slug).toBeDefined();
    expect(schema.slug).not.toBe(schema.title);
  });

  it("editing a title on disk leaves the slug and folder unchanged", async () => {
    const root = await mkdtemp(join(tmpdir(), "content-"));
    try {
      await cp(fixture("valid"), root, { recursive: true });
      const file = join(root, "content/work/a-card/index.mdx");
      const source = await readFile(file, "utf8");
      await writeFile(
        file,
        source.replace("title: Title a-card", "title: A different title"),
      );

      const edited = createContent(root);
      const entry = await edited.getWork("a-card");
      expect(entry?.title).toBe("A different title");
      expect(entry?.slug).toBe("a-card");
      expect((await edited.listWork()).map((w) => w.slug)).toContain("a-card");
      expect(await readdir(join(root, "content/work"))).toContain("a-card");
    } finally {
      await rm(root, { recursive: true, force: true });
    }
  });
});
