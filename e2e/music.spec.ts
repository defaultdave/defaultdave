import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Page } from "@playwright/test";

const BAR_BG = "rgb(12, 9, 7)";

const bodyBackground = (page: Page) =>
  page.evaluate(() => getComputedStyle(document.body).backgroundColor);

const fontFaces = (page: Page) =>
  page.evaluate(async () => {
    await document.fonts.ready;
    return [...document.fonts].map((f) => `${f.family}:${f.status}`);
  });

for (const scheme of ["light", "dark"] as const) {
  test.describe(`/music with an OS ${scheme} setting`, () => {
    test.use({ colorScheme: scheme });

    test("is always the dark bar, header and footer included", async ({
      page,
    }) => {
      await page.goto("/music");
      await expect(page.locator('[data-room="bar"]')).toHaveCount(1);
      expect(await bodyBackground(page)).toBe(BAR_BG);

      const read = (selector: string) =>
        page
          .locator(selector)
          .first()
          .evaluate((el) => getComputedStyle(el).colorScheme);
      expect(await read("html")).toBe("dark");
      expect(await read("header")).toBe("dark");
      expect(await read("footer")).toBe("dark");

      const tokens = await page.evaluate(() => {
        const style = getComputedStyle(document.documentElement);
        return {
          accent: style.getPropertyValue("--color-accent").trim(),
          mark: style.getPropertyValue("--color-mark").trim(),
          markText: style.getPropertyValue("--color-mark-text").trim(),
        };
      });
      expect(tokens).toEqual({
        accent: "#e8b86a",
        mark: "#d4892a",
        markText: "#0c0907",
      });
      await expect(page.locator("footer a").first()).toHaveCSS(
        "color",
        "rgb(232, 184, 106)",
      );
    });

    test("has no axe violations", async ({ page }) => {
      await page.goto("/music");
      await expect(page.locator("h1")).toHaveCount(1);
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations).toEqual([]);
    });
  });
}

test("shows the footer's bar-only line over a rule that hides it elsewhere", async ({
  page,
}) => {
  await page.goto("/music");
  await page.evaluate(() => {
    const style = document.createElement("style");
    style.textContent = '[data-room-only="bar"] { display: none; }';
    document.head.append(style);
    const line = document.createElement("span");
    line.dataset["roomOnly"] = "bar";
    line.id = "bar-only";
    line.textContent = "Except this room.";
    document.body.append(line);
  });
  await expect(page.locator("#bar-only")).toBeVisible();
});

test("leaves other routes alone after a client navigation away from /music", async ({
  page,
}) => {
  await page.emulateMedia({ colorScheme: "light" });
  await page.goto("/music");
  expect(await bodyBackground(page)).toBe(BAR_BG);

  await page
    .locator("header")
    .getByRole("link", { name: "Home", exact: true })
    .click();
  await page.waitForURL("/");
  await expect(page.locator('[data-room="bar"]')).toHaveCount(0);
  expect(await bodyBackground(page)).not.toBe(BAR_BG);
  expect(
    await page.evaluate(
      () => getComputedStyle(document.documentElement).colorScheme,
    ),
  ).not.toBe("dark");
});

const FONT = "/fonts/dm-serif-display-latin.woff2";

test("hints and loads the display font on /music only", async ({ page }) => {
  const fontRequests: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("dm-serif"))
      fontRequests.push(new URL(r.url()).pathname);
  });

  // Every other route, long enough for <Link> prefetch of /music to run.
  for (const path of ["/", "/work", "/about", "/articles", "/musings"]) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);
    await expect(page.locator('link[rel="preload"][as="font"]')).toHaveCount(0);
    expect(
      (await fontFaces(page)).some((f) =>
        /^DM Serif.*:(loaded|loading)/.test(f),
      ),
    ).toBe(false);
  }
  expect(fontRequests).toEqual([]);

  await page.goto("/music");
  await expect(
    page.locator(`head link[rel="preload"][as="font"][href="${FONT}"]`),
  ).toHaveCount(1);
  await page.waitForLoadState("networkidle");
  expect(
    (await fontFaces(page)).some((f) => /^DM Serif Display:loaded/.test(f)),
  ).toBe(true);
  expect(fontRequests).toEqual([FONT]);
});

test("fetches the display font when /music is reached by a client navigation", async ({
  page,
}) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  const fontRequest = page.waitForRequest((r) => r.url().includes(FONT));
  await page
    .locator("header")
    .getByRole("link", { name: "Music", exact: true })
    .click();
  await page.waitForURL("/music");
  await fontRequest;
});

for (const [width, height] of [
  [412, 823],
  [1280, 800],
] as const) {
  test(`shifts nothing as the page loads at ${String(width)} wide`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.addInitScript(() => {
      const w = window as unknown as { __cls: number };
      w.__cls = 0;
      new PerformanceObserver((list) => {
        for (const e of list.getEntries())
          w.__cls += (e as unknown as { value: number }).value;
      }).observe({ type: "layout-shift", buffered: true });
    });
    await page.goto("/music");
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);
    expect(
      await page.evaluate(() => (window as unknown as { __cls: number }).__cls),
    ).toBe(0);
  });
}

test("keeps the facade box the same size when the player loads", async ({
  page,
}) => {
  await page.route(/bandcamp\.com/, (route) => route.abort());
  await page.goto("/music");
  const box = page.locator("[data-aspect]").first();
  const before = await box.boundingBox();
  await box.getByRole("button", { name: /^Load the .* player for / }).click();
  await expect(box.locator("iframe")).toHaveCount(1);
  const after = await box.boundingBox();
  expect({ width: after?.width, height: after?.height }).toEqual({
    width: before?.width,
    height: before?.height,
  });
});

const photoLayer = (page: Page) =>
  page.locator('[data-room="bar"] > [aria-hidden="true"]:has(img)');
const smokeLayer = (page: Page) =>
  page.locator('[data-room="bar"] > [aria-hidden="true"]:not(:has(img))');
const pauseBox = (page: Page) => page.getByLabel("Pause motion");

const states = (page: Page) =>
  page.evaluate(() => {
    const photo = document.querySelector('[data-room="bar"] img');
    const puffs = document.querySelectorAll(
      '[data-room="bar"] > [aria-hidden="true"]:not(:has(img)) span',
    );
    const play = (el: Element | null) =>
      el?.getAnimations().map((a) => a.playState) ?? [];
    return { photo: play(photo), smoke: [...puffs].flatMap((p) => play(p)) };
  });

test("keeps the smoke decorative, clipped and click-through", async ({
  page,
}) => {
  await page.goto("/music");
  const smoke = smokeLayer(page);
  await expect(smoke).toHaveCount(1);
  await expect(smoke).toHaveCSS("pointer-events", "none");
  await expect(smoke).toHaveCSS("overflow", "hidden");
  await expect(smoke).toHaveCSS("position", "fixed");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(smoke.locator("span").first()).toHaveCSS(
    "animation-name",
    "none",
  );
});

test("keeps the photo decorative, fixed, behind the content and out of the tab order", async ({
  page,
}) => {
  await page.goto("/music");
  const photo = photoLayer(page);
  await expect(photo).toHaveCount(1);
  await expect(photo).toHaveCSS("position", "fixed");
  await expect(photo).toHaveCSS("pointer-events", "none");
  await expect(photo).toHaveCSS("overflow", "hidden");
  await expect(photo).toHaveCSS("z-index", "-1");
  await expect(photo.locator("img")).toHaveAttribute("alt", "");
  await expect(photo.locator("img")).toHaveCSS("filter", "none");
  // Hidden from the accessibility tree: no image, no name.
  await expect(page.getByRole("img")).toHaveCount(0);
  // Not in the tab order: tabbing through the page never lands inside it.
  const focusedInside = new Set<boolean>();
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press("Tab");
    focusedInside.add(
      await page.evaluate(() =>
        Boolean(document.activeElement?.closest('[aria-hidden="true"]')),
      ),
    );
  }
  expect([...focusedInside]).toEqual([false]);
});

test("is not preloaded and is not the largest contentful paint", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const w = window as unknown as { __lcp: string[] };
    w.__lcp = [];
    new PerformanceObserver((list) => {
      for (const e of list.getEntries()) {
        const el = (e as unknown as { element: Element | null }).element;
        w.__lcp.push(el ? el.tagName : "none");
      }
    }).observe({ type: "largest-contentful-paint", buffered: true });
  });
  await page.goto("/music");
  await page.waitForLoadState("networkidle");
  await expect(page.locator('link[rel="preload"][as="image"]')).toHaveCount(0);
  const lcp = await page.evaluate(
    () => (window as unknown as { __lcp: string[] }).__lcp,
  );
  expect(lcp.length).toBeGreaterThan(0);
  expect(lcp.at(-1)).not.toBe("IMG");
});

test("requests the photo on /music only", async ({ page }) => {
  const seen: string[] = [];
  page.on("request", (r) => {
    if (r.url().includes("/images/music/")) seen.push(r.url());
  });
  for (const path of ["/", "/work", "/about", "/articles", "/musings"]) {
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(500);
  }
  expect(seen).toEqual([]);
  await page.goto("/music");
  await page.waitForLoadState("networkidle");
  expect(seen).toHaveLength(1);
});

for (const [width, height] of [
  [390, 844],
  [844, 390],
  [1280, 800],
  [1000, 1000],
  [600, 2000],
  [3440, 1440],
] as const) {
  test(`covers a ${String(width)} by ${String(height)} viewport at every point of the path`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/music");
    const gaps = await page.evaluate(() => {
      const img = document.querySelector('[data-room="bar"] img');
      const animation = img?.getAnimations()[0];
      if (!img || !animation) throw new Error("No photo animation");
      const duration = Number(animation.effect?.getTiming().duration);
      animation.pause();
      const out: string[] = [];
      for (const f of [0, 0.01, 0.25, 0.5, 0.75, 0.99, 1]) {
        animation.currentTime = duration * f;
        const r = img.getBoundingClientRect();
        const short = Math.max(
          r.left,
          r.top,
          innerWidth - r.right,
          innerHeight - r.bottom,
        );
        // The image must reach past every edge; a positive value is a bare strip.
        if (short > 0) out.push(`${String(f)}: ${short.toFixed(1)}px short`);
      }
      return out;
    });
    expect(gaps).toEqual([]);
  });
}

test("pauses the photo and the smoke together from the keyboard, without script", async ({
  page,
}) => {
  await page.goto("/music");
  const box = pauseBox(page);
  await expect(box).toBeVisible();
  await expect(box).not.toBeChecked();
  expect(await states(page)).toEqual({
    photo: ["running"],
    smoke: ["running", "running", "running", "running"],
  });

  await box.focus();
  await page.keyboard.press("Space");
  await expect(box).toBeChecked();
  expect(await states(page)).toEqual({
    photo: ["paused"],
    smoke: ["paused", "paused", "paused", "paused"],
  });

  await page.keyboard.press("Space");
  expect((await states(page)).photo).toEqual(["running"]);
});

test.describe("with scripting off", () => {
  test.use({ javaScriptEnabled: false });

  test("pauses the photo from the checkbox alone", async ({ page }) => {
    await page.goto("/music");
    await pauseBox(page).check();
    await expect(page.locator('[data-room="bar"] img')).toHaveCSS(
      "animation-play-state",
      "paused",
    );
  });
});

test("holds still and hides the pause control under reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/music");
  await expect(page.locator('[data-room="bar"] img')).toHaveCSS(
    "animation-name",
    "none",
  );
  await expect(smokeLayer(page).locator("span").first()).toHaveCSS(
    "animation-name",
    "none",
  );
  expect(await states(page)).toEqual({ photo: [], smoke: [] });
  await expect(pauseBox(page)).toHaveCount(1);
  await expect(pauseBox(page)).toBeHidden();
});

test("credits the photographer below the releases and above the footer", async ({
  page,
}) => {
  await page.goto("/music");
  const credit = page.locator("p", { hasText: "Photo:" });
  await expect(credit).toHaveText("Photo: Morgan Shortell");
  await expect(
    credit.getByRole("link", { name: "Morgan Shortell" }),
  ).toHaveAttribute("href", "http://www.kmestudio12.com/");
  const y = async (selector: string) =>
    (await page.locator(selector).last().boundingBox())?.y ?? Number.NaN;
  const creditY = (await credit.boundingBox())?.y ?? Number.NaN;
  expect(creditY).toBeGreaterThan(await y('[data-room="bar"] ul > li'));
  expect(creditY).toBeLessThan(await y("footer"));
});
