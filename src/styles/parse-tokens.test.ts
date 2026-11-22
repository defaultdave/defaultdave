import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { parseTokens } from "./parse-tokens";

const LIGHT = ":root { --color-bg: #fff; }";
const DARK =
  "@media (prefers-color-scheme: dark) { :root { --color-bg: #000; } }";

describe("parseTokens", () => {
  it("parses light and dark maps from well-formed css", () => {
    expect(parseTokens(`${LIGHT}\n${DARK}`)).toEqual({
      light: { "--color-bg": "#fff" },
      dark: { "--color-bg": "#000" },
    });
  });

  it("throws naming the dark block when it is missing", () => {
    expect(() => parseTokens(LIGHT)).toThrow(/prefers-color-scheme: dark/);
  });

  it("throws naming the :root block when it is missing", () => {
    expect(() => parseTokens(DARK)).toThrow(/top-level :root/);
  });

  it("still parses the real tokens.css", () => {
    const css = readFileSync(join(__dirname, "tokens.css"), "utf8");
    const { light, dark } = parseTokens(css);
    for (const name of [
      "--color-bg",
      "--color-text",
      "--color-muted",
      "--color-accent",
      "--color-visited",
      "--color-border",
      "--color-rule",
      "--color-focus",
      "--color-mark",
      "--color-mark-text",
      "--color-button",
      "--font-whimsy",
    ]) {
      expect(light[name], name).toBeDefined();
    }
    for (const name of [
      "--color-pop-1",
      "--color-ink",
      "--effect-shadow",
      "--radius-pill",
    ]) {
      expect(light[name], name).toBeUndefined();
    }
    expect(Object.keys(dark).length).toBeGreaterThan(0);
  });
});
