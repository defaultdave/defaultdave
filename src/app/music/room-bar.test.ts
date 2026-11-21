import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const css = readFileSync(
  join(import.meta.dirname, "../../styles/room-bar.css"),
  "utf8",
);

function channel(value: number): number {
  const c = value / 255;
  return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
}

function luminance(hex: string): number {
  const n = parseInt(hex.slice(1), 16);
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

function token(name: string): string {
  const match = new RegExp(`--color-${name}:\\s*(#[0-9a-f]{6});`, "i").exec(
    css,
  );
  if (!match?.[1]) throw new Error(`Missing --color-${name} in room-bar.css`);
  return match[1];
}

describe("room-bar.css", () => {
  it("scopes every rule to the bar room", () => {
    const withoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
    const selectors = [...withoutComments.matchAll(/([^{}]+)\{/g)]
      .map((m) => m[1]?.trim() ?? "")
      .filter((s) => !s.startsWith("@") && !/^\d+%$|^(from|to)$/.test(s));
    expect(selectors.length).toBeGreaterThan(0);
    for (const selector of selectors) {
      expect(selector).toContain(':root:has([data-room="bar"])');
    }
  });

  it.each([
    ["text", "bg"],
    ["text", "surface"],
    ["muted", "bg"],
    ["muted", "surface"],
    ["accent", "bg"],
    ["accent", "surface"],
    ["visited", "bg"],
    ["visited", "surface"],
    ["mark", "bg"],
    ["mark-text", "mark"],
  ])("keeps %s on %s at 4.5:1 or better", (fg, bg) => {
    expect(ratio(token(fg), token(bg))).toBeGreaterThanOrEqual(4.5);
  });

  it.each([
    ["border", "bg"],
    ["border", "surface"],
    ["focus", "bg"],
  ])("keeps %s on %s at 3:1 or better", (fg, bg) => {
    expect(ratio(token(fg), token(bg))).toBeGreaterThanOrEqual(3);
  });
});
