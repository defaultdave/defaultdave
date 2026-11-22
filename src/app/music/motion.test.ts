import { existsSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

const root = join(import.meta.dirname, "../../..");
const css = readFileSync(join(import.meta.dirname, "page.module.css"), "utf8");

/** The body of the first rule or at-rule whose prelude matches. */
function block(prelude: RegExp): string {
  const match = prelude.exec(css);
  if (!match) throw new Error(`No block for ${String(prelude)}`);
  let depth = 0;
  for (let i = css.indexOf("{", match.index); i < css.length; i++) {
    if (css[i] === "{") depth++;
    if (css[i] === "}" && --depth === 0) {
      return css.slice(css.indexOf("{", match.index) + 1, i);
    }
  }
  throw new Error("Unclosed block");
}

describe("the photo layer", () => {
  it("runs no CSS filter on the moving image", () => {
    expect(block(/^\.photoImage\s*\{/m)).not.toMatch(/filter/);
    expect(block(/^\.photo\s*\{/m)).not.toMatch(/filter/);
  });

  it("animates transform and nothing else", () => {
    const keyframes = block(/@keyframes glide\s*\{/);
    const props = [...keyframes.matchAll(/([\w-]+)\s*:/g)].map((m) => m[1]);
    expect(new Set(props)).toEqual(new Set(["transform"]));
  });

  it("is fixed, clipped, click-through and behind the content", () => {
    const rule = block(/^\.photo\s*\{/m);
    expect(rule).toMatch(/position:\s*fixed/);
    expect(rule).toMatch(/overflow:\s*hidden/);
    expect(rule).toMatch(/pointer-events:\s*none/);
    expect(rule).toMatch(/z-index:\s*-1/);
  });

  it("travels at 65 degrees over 24.6 s, ease-in-out, there and back", () => {
    const rule = block(/^\.photoImage\s*\{/m);
    expect(rule).toMatch(
      /animation:\s*glide 24\.6s ease-in-out infinite alternate/,
    );
    const photo = block(/^\.photo\s*\{/m);
    // cos 65 = 0.4226, sin 65 = 0.9063: the slack ratios are their quotients.
    expect(Number(/--slack-y\) \* ([\d.]+)\)/.exec(photo)?.[1])).toBeCloseTo(
      0.4226 / 0.9063,
      3,
    );
    expect(Number(/--slack-x\) \* ([\d.]+),/.exec(photo)?.[1])).toBeCloseTo(
      0.9063 / 0.4226,
      3,
    );
  });

  it("grades with 45% amber in colour blend mode and 75% darkness", () => {
    expect(block(/^\.tint\s*\{/m)).toMatch(/#a8641c/);
    expect(block(/^\.tint\s*\{/m)).toMatch(/mix-blend-mode:\s*color/);
    expect(block(/^\.tint\s*\{/m)).toMatch(/opacity:\s*0\.45/);
    expect(block(/^\.dim\s*\{/m)).toMatch(/opacity:\s*0\.75/);
  });
});

describe("the pause control and reduced motion", () => {
  it("pauses the photo and the smoke together when the box is checked", () => {
    expect(css).toMatch(
      /\.page:has\(\.pauseInput:checked\) \.photoImage,\s*\.page:has\(\.pauseInput:checked\) \.puff\s*\{\s*animation-play-state:\s*paused/,
    );
  });

  it("stops both animations and hides the control under reduced motion", () => {
    const reduced = block(/@media \(prefers-reduced-motion: reduce\)\s*\{/);
    expect(reduced).toMatch(/\.photoImage[^}]*\{\s*animation:\s*none/);
    expect(reduced).toMatch(/\.puff:nth-child\(n\)/);
    expect(reduced).toMatch(/\.pause\s*\{\s*display:\s*none/);
  });
});

describe("the display font", () => {
  it("loads with font-display: optional from public/fonts", () => {
    const face = block(/@font-face\s*\{\s*font-family:\s*"DM Serif Display";/);
    expect(face).toMatch(/font-display:\s*optional/);
    const url = /url\("([^"]+)"\)/.exec(face)?.[1] ?? "";
    expect(url).toBe("/fonts/dm-serif-display-latin.woff2");
    expect(existsSync(join(root, "public", url))).toBe(true);
  });

  it("keeps a size-adjusted fallback face for when the font is late", () => {
    const face = block(
      /@font-face\s*\{\s*font-family:\s*"DM Serif Display Fallback"/,
    );
    expect(face).toMatch(/size-adjust:\s*109\.78%/);
    expect(face).toMatch(/local\("Times New Roman"\)/);
    expect(face).toMatch(/local\("Liberation Serif"\)/);
    expect(block(/^\.page\s*\{/m)).toMatch(
      /--music-font-display:\s*"DM Serif Display",\s*"DM Serif Display Fallback"/,
    );
  });

  it("ships the OFL text beside the font, with the font's own copyright line", () => {
    const license = readFileSync(join(root, "public/fonts/OFL.txt"), "utf8");
    expect(license).toMatch(/^Copyright 2014 - 2017 Adobe Systems/);
    expect(license).toContain("Copyright 2019 Google LLC");
    expect(license).toContain(
      "SIL OPEN FONT LICENSE Version 1.1 - 26 February 2007",
    );
    expect(license).toContain("DEALINGS IN THE FONT SOFTWARE.");
    expect(license).not.toMatch(/Inter Project/);
  });
});

describe("the published photo", () => {
  const file = readFileSync(
    join(root, "public/images/music/music-room-640.webp"),
  );
  const text = file.toString("latin1");

  it("is a small WebP", () => {
    expect(text.slice(0, 4)).toBe("RIFF");
    expect(text.slice(8, 12)).toBe("WEBP");
    expect(
      statSync(join(root, "public/images/music/music-room-640.webp")).size,
    ).toBeLessThan(20_000);
  });

  it("keeps the creator and copyright and nothing else", () => {
    expect(text).toContain("Photographer: Morgan Shortell");
    expect(text).toContain("Copyright: KMEstudio12");
    const chunks: string[] = [];
    for (let at = 12; at < file.length;) {
      chunks.push(file.toString("latin1", at, at + 4));
      at += 8 + file.readUInt32LE(at + 4) + (file.readUInt32LE(at + 4) % 2);
    }
    expect(chunks.filter((c) => c !== "VP8 ")).toEqual(["VP8X", "EXIF"]);
    expect(text).not.toMatch(/Photoshop|Adobe|XMP|GPS|ICCP/i);
    expect(text).not.toMatch(/\d{4}:\d{2}:\d{2}/);
  });
});
