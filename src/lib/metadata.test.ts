import { describe, expect, it } from "vitest";

import { pageMetadata, socialMetadata } from "./metadata";

const base = {
  title: "Aurora",
  description: "A case study.",
  path: "/work/aurora",
  section: "work",
} as const;

describe("pageMetadata", () => {
  it("carries title, description and a self canonical", () => {
    const m = pageMetadata(base);
    expect(m.title).toBe("Aurora");
    expect(m.description).toBe("A case study.");
    expect(m.alternates).toEqual({ canonical: "/work/aurora" });
  });

  it("lets a canonical override win", () => {
    const m = pageMetadata({ ...base, canonical: "https://example.com/x" });
    expect(m.alternates).toEqual({ canonical: "https://example.com/x" });
  });

  it("passes an absolute title through untouched", () => {
    expect(
      pageMetadata({ ...base, title: { absolute: "David Fleming" } }).title,
    ).toEqual({ absolute: "David Fleming" });
  });
});

describe("socialMetadata", () => {
  it("repeats the site fields the layout's openGraph would lose", () => {
    const { openGraph } = socialMetadata(base);
    expect(openGraph).toMatchObject({
      type: "website",
      siteName: "David Fleming",
      locale: "en_US",
      title: "Aurora",
      description: "A case study.",
      url: "/work/aurora",
    });
  });

  it.each(["home", "work", "articles", "musings", "music", "about"] as const)(
    "points %s at its static 1200x630 image",
    (section) => {
      const { openGraph, twitter } = socialMetadata({ ...base, section });
      expect(openGraph?.images).toEqual([
        expect.objectContaining({
          url: `/og/${section}.png`,
          width: 1200,
          height: 630,
        }),
      ]);
      expect(twitter?.images).toEqual([
        expect.objectContaining({ url: `/og/${section}.png` }),
      ]);
    },
  );

  it("uses the large image card for Twitter", () => {
    expect(socialMetadata(base).twitter).toMatchObject({
      card: "summary_large_image",
      title: "Aurora",
      description: "A case study.",
    });
  });

  it("marks an article and records when it was published", () => {
    const { openGraph } = socialMetadata({
      ...base,
      type: "article",
      publishedTime: "2026-05-01",
    });
    expect(openGraph).toMatchObject({
      type: "article",
      publishedTime: "2026-05-01",
    });
  });

  it("omits publishedTime when none is given", () => {
    expect(socialMetadata(base).openGraph).not.toHaveProperty("publishedTime");
  });
});
