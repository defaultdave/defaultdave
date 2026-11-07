import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { parseTokens, type TokenMap } from "./parse-tokens";

const css = readFileSync(join(import.meta.dirname, "tokens.css"), "utf8");
const { light, dark } = parseTokens(css);
const themes = { light, dark: { ...light, ...dark } } satisfies Record<
  string,
  TokenMap
>;

function channel(value: number): number {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const match = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!match?.[1]) throw new Error(`Not a 6-digit hex colour: ${hex}`);
  const n = parseInt(match[1], 16);
  return (
    0.2126 * channel((n >> 16) & 255) +
    0.7152 * channel((n >> 8) & 255) +
    0.0722 * channel(n & 255)
  );
}

function ratio(a: string, b: string): number {
  const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return ((hi ?? 0) + 0.05) / ((lo ?? 0) + 0.05);
}

function colour(theme: TokenMap, token: string): string {
  const value = theme[`--color-${token}`];
  if (value === undefined) throw new Error(`Missing --color-${token}`);
  return value;
}

// [foreground, background]
const textPairs = [
  ["text", "bg"],
  ["text", "surface"],
  ["muted", "bg"],
  ["muted", "surface"],
  ["accent", "bg"],
  ["accent", "surface"],
  ["on-accent", "accent"],
  ["ink", "pop-1"],
  ["ink", "pop-2"],
  ["ink", "pop-3"],
  ["ink", "pop-4"],
] as const;

const uiPairs = [
  ["border", "bg"],
  ["border", "surface"],
  ["focus", "bg"],
  ["focus", "surface"],
] as const;

describe.each(Object.entries(themes))("%s palette", (_name, theme) => {
  it.each(textPairs)(
    "text: --color-%s on --color-%s is at least 4.5:1",
    (fg, bg) => {
      expect(
        ratio(colour(theme, fg), colour(theme, bg)),
      ).toBeGreaterThanOrEqual(4.5);
    },
  );

  it.each(uiPairs)(
    "UI: --color-%s against --color-%s is at least 3:1",
    (fg, bg) => {
      expect(
        ratio(colour(theme, fg), colour(theme, bg)),
      ).toBeGreaterThanOrEqual(3);
    },
  );
});

describe("token parsing", () => {
  it("finds both palettes in tokens.css", () => {
    expect(light["--color-bg"]).toBeDefined();
    expect(dark["--color-bg"]).toBeDefined();
    expect(dark["--color-bg"]).not.toBe(light["--color-bg"]);
  });

  it("computes the WCAG ratio (black on white is 21:1)", () => {
    expect(ratio("#000000", "#ffffff")).toBeCloseTo(21, 5);
  });
});
