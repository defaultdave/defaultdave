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

test("loads the display font on /music only", async ({ page }) => {
  const homeFontRequests: string[] = [];
  page.on("request", (r) => {
    if (r.resourceType() === "font") homeFontRequests.push(r.url());
  });
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  expect(
    (await fontFaces(page)).some((f) => /^DM Serif.*:(loaded|loading)/.test(f)),
  ).toBe(false);

  const musicFontRequests: string[] = [];
  page.removeAllListeners("request");
  page.on("request", (r) => {
    if (r.resourceType() === "font") musicFontRequests.push(r.url());
  });
  await page.goto("/music");
  await page.waitForLoadState("networkidle");
  expect(
    (await fontFaces(page)).some((f) => /^DM Serif Display:loaded/.test(f)),
  ).toBe(true);
  expect(musicFontRequests.some((url) => !homeFontRequests.includes(url))).toBe(
    true,
  );
});

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

test("keeps the smoke decorative, clipped and click-through", async ({
  page,
}) => {
  await page.goto("/music");
  const smoke = page
    .locator('[data-room="bar"] > [aria-hidden="true"]')
    .first();
  await expect(smoke).toHaveCSS("pointer-events", "none");
  await expect(smoke).toHaveCSS("overflow", "hidden");
  await expect(smoke).toHaveCSS("position", "fixed");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(smoke.locator("span").first()).toHaveCSS(
    "animation-name",
    "none",
  );
});
