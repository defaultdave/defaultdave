/**
 * Renders the six link-preview cards in public/og/ from one HTML template.
 *
 *   pnpm exec node scripts/og/render.mjs             write public/og/*.png
 *   pnpm exec node scripts/og/render.mjs --contrast  also print text contrast per card
 *
 * Offline: Inter, Gelasio italic (scripts/og/fonts/) and DM Serif Display
 * (public/fonts/) are inlined from disk, and the Music card reads
 * public/images/music/music-room-640.webp. Nothing touches the network.
 * Uses the project's @playwright/test Chromium. If Playwright reports a
 * missing browser revision, point OG_CHROMIUM at a chrome-headless-shell
 * binary, for example
 *   ~/Library/Caches/ms-playwright/chromium_headless_shell-<rev>/chrome-headless-shell-mac-arm64/chrome-headless-shell
 *
 * The look is the "Defaults" direction picked in #106. Change the template or
 * the CARDS table below and run it again; the output is deterministic.
 */
import { readFile, writeFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "@playwright/test";

import { recompress } from "./png.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const OUT = join(ROOT, "public", "og");
const WIDTH = 1200;
const HEIGHT = 630;
/** Each card must stay under this, in bytes (the #106 budget is 300 KB). */
const MAX_BYTES = 300_000;

/** Copy for each card. `url` is absent on Music, which has no foot. */
const CARDS = [
  {
    name: "home",
    title: "David Fleming",
    long: true,
    description: "Work, articles, musings and music",
    url: "davidfleming.me",
  },
  {
    name: "work",
    title: "Work",
    description: "Case studies and smaller projects",
    url: "davidfleming.me/work",
  },
  {
    name: "articles",
    title: "Articles",
    description: "Longer pieces, and where they were first published",
    url: "davidfleming.me/articles",
  },
  {
    name: "musings",
    title: "Musings",
    highlight: true,
    description: "Short posts by David Fleming",
    url: "davidfleming.me/musings",
  },
  {
    name: "music",
    title: "Music",
    music: true,
    // 7 bits per channel keeps the photo card under the size budget; the grain is invisible at this brightness.
    bits: 7,
    description: "Releases, newest first, with notes",
    credit: "Photo: Morgan Shortell",
  },
  {
    name: "about",
    title: "About",
    description: "A short bio and where to find him",
    url: "davidfleming.me/about",
  },
];

const FOOT_NOTE = "All settings left at default.";

async function dataUri(path, mime) {
  const bytes = await readFile(join(ROOT, path));
  return `data:${mime};base64,${bytes.toString("base64")}`;
}

async function loadAssets() {
  const [inter, gelasio, dmSerif, photo] = await Promise.all([
    dataUri("scripts/og/fonts/inter-latin.woff2", "font/woff2"),
    dataUri("scripts/og/fonts/gelasio-italic-500-latin.woff2", "font/woff2"),
    dataUri("public/fonts/dm-serif-display-latin.woff2", "font/woff2"),
    dataUri("public/images/music/music-room-640.webp", "image/webp"),
  ]);
  return { inter, gelasio, dmSerif, photo };
}

const esc = (s) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/** Font faces and the card styles. Every size is a px of the 1200 x 630 image. */
function styles(a) {
  return `
@font-face{font-family:Inter;font-weight:400 800;src:url(${a.inter}) format("woff2")}
@font-face{font-family:Gelasio;font-style:italic;font-weight:500;src:url(${a.gelasio}) format("woff2")}
@font-face{font-family:"DM Serif Display";src:url(${a.dmSerif}) format("woff2")}
*{box-sizing:border-box;margin:0}
html,body{width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;background:#fff}
.card{position:relative;width:${WIDTH}px;height:${HEIGHT}px;overflow:hidden;display:flex;flex-direction:column;font-family:Inter,sans-serif;-webkit-font-smoothing:antialiased}

/* Light cards */
.card.light{background:#fff;color:#000;padding:72px 88px}
.light .mark{font-weight:800;font-size:38px;letter-spacing:-.01em;display:flex;align-items:center;gap:4px}
.light .mark i{display:inline-block;width:16px;height:38px;background:#000}
.light .t{font-weight:800;font-size:132px;line-height:1;letter-spacing:-.025em;margin-top:auto}
.light.long .t{font-size:104px}
.light .d{font-size:40px;color:#5c5c5c;margin-top:22px;max-width:980px;line-height:1.25}
.light .foot{display:flex;justify-content:space-between;align-items:baseline;border-top:2px solid #c0c0c0;margin-top:44px;padding-top:22px;font-size:28px}
.light .foot u{color:#0000ee;text-underline-offset:.15em}
.light .foot s{text-decoration:none;color:#5c5c5c}
.hl{display:inline-block;font-family:Gelasio,Georgia,serif;font-style:italic;font-weight:500;font-size:140px;letter-spacing:0;background:#ff0;color:#000;padding:0 28px 6px;transform:rotate(-2deg);transform-origin:left bottom}
.t:has(.hl){align-self:flex-start}
.bubbles{position:absolute;right:110px;top:150px;width:220px;height:200px}
.bubbles i{position:absolute;border:4px solid #000;border-radius:50%;background:#fff}
.bubbles i:nth-child(1){width:150px;height:104px;right:0;top:0}
.bubbles i:nth-child(2){width:40px;height:40px;right:150px;top:118px}
.bubbles i:nth-child(3){width:20px;height:20px;right:196px;top:170px}
.bubbles b{position:absolute;right:40px;top:18px;font:italic 500 52px/1 Gelasio,Georgia,serif}

/* Music card */
.card.music{background:#0c0907;color:#f3e6d3;padding:64px 88px;isolation:isolate}
.music .ph{position:absolute;inset:-60px;z-index:-3;background:url(${a.photo}) 50% 30%/cover;filter:blur(4px)}
.music .tint{position:absolute;inset:0;z-index:-2;background:#a8641c;opacity:.45;mix-blend-mode:color}
.music .dim{position:absolute;inset:0;z-index:-1;background:radial-gradient(ellipse 60% 70% at 18% 0%,rgb(12 9 7/55%),rgb(12 9 7/82%))}
.music .mark{font-weight:800;font-size:34px;display:flex;align-items:center;gap:4px}
.music .mark i{display:inline-block;width:14px;height:34px;background:#f3e6d3}
.music .eye{margin-top:auto;font-weight:600;font-size:24px;letter-spacing:.3em;color:#e6a54a}
.music .t{font-family:"DM Serif Display",Georgia,serif;font-size:170px;line-height:1;margin-top:10px;text-shadow:0 0 40px rgb(230 165 74/45%)}
.music .rule{height:8px;border-top:2px solid #c9832d;border-bottom:2px solid #c9832d;margin-top:26px}
.music .d{display:flex;justify-content:space-between;align-items:baseline;margin-top:22px;font-size:32px;color:#eadcc6}
.music .d small{font-size:20px;color:#bfae98}
`;
}

function cardMarkup(c) {
  if (c.music) {
    return `<div class="card music"><div class="ph"></div><div class="tint"></div><div class="dim"></div>
<div class="mark" data-text>DefaultDave<i></i></div><div class="eye" data-text>NOW PLAYING</div>
<div class="t" data-text>${esc(c.title)}</div><div class="rule"></div>
<div class="d"><span data-text>${esc(c.description)}</span><small data-text>${esc(c.credit)}</small></div></div>`;
  }
  const bubbles = c.highlight
    ? `<div class="bubbles" aria-hidden="true"><i></i><i></i><i></i><b data-text>hm.</b></div>`
    : "";
  const title = c.highlight
    ? `<span class="hl" data-text>${esc(c.title)}</span>`
    : esc(c.title);
  return `<div class="card light${c.long ? " long" : ""}">${bubbles}
<div class="mark" data-text>DefaultDave<i></i></div>
<div class="t"${c.highlight ? "" : " data-text"}>${title}</div>
<div class="d" data-text>${esc(c.description)}</div>
<div class="foot"><u data-text>${esc(c.url)}</u><s data-text>${FOOT_NOTE}</s></div></div>`;
}

function page(c, assets) {
  return `<!doctype html><meta charset="utf-8"><style>${styles(assets)}</style>${cardMarkup(c)}`;
}

/** Parse "rgb(r, g, b)" or "rgba(r, g, b, a)" into [r, g, b]. */
const parseRgb = (s) =>
  s
    .match(/[\d.]+/g)
    .slice(0, 3)
    .map(Number);

const lum = ([r, g, b]) => {
  const f = (v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};

const ratio = (a, b) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
};

/**
 * For each text element, the worst contrast between its colour and the pixels
 * behind its glyphs. Renders the card with all text transparent, then once per
 * element with only that element's text on; the pixels that differ are the
 * glyph ink, and the background render under that ink is what gets sampled.
 */
async function measureContrast(browser, c, assets) {
  const p = await browser.newPage({
    viewport: { width: WIDTH, height: HEIGHT },
  });
  await p.setContent(page(c, assets));
  await p.evaluate(() => document.fonts.ready);
  await p.addStyleTag({
    content:
      "[data-text],[data-text] *{text-shadow:none!important}.bubbles i{border-color:#fff!important}",
  });
  const count = await p.evaluate(() => {
    for (const el of document.querySelectorAll("[data-text]")) {
      el.dataset.color = getComputedStyle(el).color;
      el.style.setProperty("color", "transparent", "important");
    }
    return document.querySelectorAll("[data-text]").length;
  });
  const shot = async () =>
    (await p.screenshot({ type: "png" })).toString("base64");
  const bg = await shot();
  const rows = [];
  for (let i = 0; i < count; i += 1) {
    const info = await p.evaluate((i) => {
      const el = document.querySelectorAll("[data-text]")[i];
      el.style.setProperty("color", el.dataset.color, "important");
      return { text: el.textContent, color: el.dataset.color };
    }, i);
    const on = await shot();
    await p.evaluate((i) => {
      document
        .querySelectorAll("[data-text]")
        [i].style.setProperty("color", "transparent", "important");
    }, i);
    const px = await p.evaluate(
      async ({ bg, on }) => {
        const load = async (b64) => {
          const img = new Image();
          img.src = `data:image/png;base64,${b64}`;
          await img.decode();
          const cv = document.createElement("canvas");
          cv.width = img.width;
          cv.height = img.height;
          const ctx = cv.getContext("2d", { willReadFrequently: true });
          ctx.drawImage(img, 0, 0);
          return ctx.getImageData(0, 0, img.width, img.height);
        };
        const [a, b] = await Promise.all([load(bg), load(on)]);
        const out = [];
        for (let k = 0; k < a.data.length; k += 4) {
          const diff =
            Math.abs(a.data[k] - b.data[k]) +
            Math.abs(a.data[k + 1] - b.data[k + 1]) +
            Math.abs(a.data[k + 2] - b.data[k + 2]);
          if (diff > 60) out.push([a.data[k], a.data[k + 1], a.data[k + 2]]);
        }
        return out;
      },
      { bg, on },
    );
    rows.push({ ...info, px });
  }
  await p.close();
  return rows.map((r) => {
    const fg = parseRgb(r.color);
    let worst = Infinity;
    for (const px of r.px) worst = Math.min(worst, ratio(fg, px));
    return {
      text: r.text.trim(),
      color: r.color,
      ratio: worst,
      ink: r.px.length,
    };
  });
}

async function main() {
  const wantContrast = process.argv.includes("--contrast");
  const assets = await loadAssets();
  const executablePath = process.env.OG_CHROMIUM || undefined;
  const browser = await chromium.launch(
    executablePath ? { executablePath } : {},
  );
  try {
    for (const c of CARDS) {
      const p = await browser.newPage({
        viewport: { width: WIDTH, height: HEIGHT },
        deviceScaleFactor: 1,
      });
      await p.setContent(page(c, assets));
      await p.evaluate(() => document.fonts.ready);
      const png = recompress(await p.screenshot({ type: "png" }), c.bits);
      await p.close();
      if (png.length > MAX_BYTES) {
        throw new Error(
          `${c.name}.png is ${png.length} bytes, over ${MAX_BYTES}`,
        );
      }
      const file = join(OUT, `${c.name}.png`);
      await writeFile(file, png);
      console.log(`${c.name}.png  ${(png.length / 1024).toFixed(1)} KB`);
      if (wantContrast) {
        for (const r of await measureContrast(browser, c, assets)) {
          const flag = r.ratio >= 4.5 ? "ok  " : "FAIL";
          console.log(
            `  ${flag} ${r.ratio.toFixed(2)}:1  ${r.color}  ${r.text}`,
          );
        }
      }
    }
  } finally {
    await browser.close();
  }
}

await main();
