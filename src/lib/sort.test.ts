import { describe, expect, it } from "vitest";

import {
  sortPostsNewestFirst,
  sortReleasesNewestFirst,
  sortWork,
} from "./sort";

describe("sortWork", () => {
  it("puts featured first, then lower order, then slug", () => {
    const sorted = sortWork([
      { slug: "d", featured: false, order: 1 },
      { slug: "b", featured: true, order: 2 },
      { slug: "c", featured: true, order: 1 },
      { slug: "a", featured: true, order: 1 },
    ]);
    expect(sorted.map((e) => e.slug)).toEqual(["a", "c", "b", "d"]);
  });

  it("does not mutate its input", () => {
    const input = [
      { slug: "b", featured: false, order: 2 },
      { slug: "a", featured: false, order: 1 },
    ];
    sortWork(input);
    expect(input.map((e) => e.slug)).toEqual(["b", "a"]);
  });
});

describe("sortPostsNewestFirst", () => {
  it("orders by publishedAt descending, ties by slug", () => {
    const sorted = sortPostsNewestFirst([
      { slug: "old", publishedAt: "2024-01-01" },
      { slug: "b", publishedAt: "2026-05-01" },
      { slug: "a", publishedAt: "2026-05-01" },
    ]);
    expect(sorted.map((p) => p.slug)).toEqual(["a", "b", "old"]);
  });
});

describe("sortReleasesNewestFirst", () => {
  it("orders by year descending, ties by title", () => {
    const sorted = sortReleasesNewestFirst([
      { title: "Z", year: 2020 },
      { title: "B", year: 2024 },
      { title: "A", year: 2024 },
    ]);
    expect(sorted.map((r) => r.title)).toEqual(["A", "B", "Z"]);
  });
});
