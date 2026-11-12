import { describe, expect, it } from "vitest";

import { caseStudies, cards } from "./work-kind";

const entries = [
  { slug: "a", kind: "case-study" },
  { slug: "b", kind: "card" },
  { slug: "c", kind: "case-study" },
] as const;

describe("work kinds", () => {
  it("keeps case studies in arrival order", () => {
    expect(caseStudies(entries).map((e) => e.slug)).toEqual(["a", "c"]);
  });

  it("keeps cards in arrival order", () => {
    expect(cards(entries).map((e) => e.slug)).toEqual(["b"]);
  });

  it.each([caseStudies, cards])("returns nothing for no entries", (pick) => {
    expect(pick([])).toEqual([]);
  });
});
