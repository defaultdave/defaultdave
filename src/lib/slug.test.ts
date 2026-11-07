import { describe, expect, it } from "vitest";
import { slugify } from "./slug";

describe("slugify", () => {
  it.each([
    ["Hello World", "hello-world"],
    ["  Tuscany   Rule!  ", "tuscany-rule"],
    ["Café déjà vu", "cafe-deja-vu"],
    ["", ""],
  ])("turns %j into %j", (input, expected) => {
    expect(slugify(input)).toBe(expected);
  });
});
