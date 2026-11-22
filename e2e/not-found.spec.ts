import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

const MISSING = "/no-such-page";

test("an unknown route answers 404 with the error page", async ({ page }) => {
  const response = await page.goto(MISSING);
  expect(response?.status()).toBe(404);
  await expect(page.locator("h1")).toHaveText("This page can’t be found");
  await expect(page.getByText("HTTP ERROR 404")).toBeVisible();
  await expect(page.getByRole("link", { name: "Go home" })).toHaveAttribute(
    "href",
    "/",
  );
  await expect(
    page.getByRole("main").getByRole("link", { name: "Restore defaults" }),
  ).toHaveAttribute("href", "/");
});

test("names the requested path once the page has hydrated", async ({
  page,
}) => {
  await page.goto(MISSING);
  await expect(page.getByText(`davidfleming.me${MISSING}`)).toBeVisible();
});

test("the Details disclosure is closed, then opens", async ({ page }) => {
  await page.goto(MISSING);
  const details = page.locator("details");
  await expect(details).not.toHaveAttribute("open", "");
  await details.getByText("Details").click();
  await expect(details).toHaveAttribute("open", "");
});

test("the 404 icon is hidden from assistive tech", async ({ page }) => {
  await page.goto(MISSING);
  await expect(page.locator('main svg[aria-hidden="true"]')).toHaveCount(1);
});

test("stops the spinning gear under reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(MISSING);
  const animation = await page
    .locator("main svg g")
    .first()
    .evaluate((el) => getComputedStyle(el).animationName);
  expect(animation).toBe("none");
});

for (const colorScheme of ["light", "dark"] as const) {
  test.describe(`${colorScheme} scheme`, () => {
    test.use({ colorScheme });

    test("the 404 page has no axe violations", async ({ page }) => {
      await page.goto(MISSING);
      const results = await new AxeBuilder({ page }).analyze();
      expect(results.violations).toEqual([]);
    });
  });
}
