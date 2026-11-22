import { describe, expect, it } from "vitest";

import { requestedPathLabel } from "./requested-path";

describe("requestedPathLabel", () => {
  it.each([
    ["null (server render, before hydration)", null],
    ["an empty path", ""],
    ["the internal not-found route", "/_not-found"],
  ])("returns null for %s", (_name, path) => {
    expect(requestedPathLabel(path)).toBeNull();
  });

  it("prefixes a normal path with the domain", () => {
    expect(requestedPathLabel("/nope/here")).toBe("davidfleming.me/nope/here");
  });
});
