import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("home renders a single h1", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toHaveCount(1);
});

const routes = [
  "/",
  "/work",
  "/articles/tuscany-rule",
  "/musings",
  "/about",
] as const;

for (const colorScheme of ["light", "dark"] as const) {
  test.describe(`${colorScheme} scheme`, () => {
    test.use({ colorScheme });

    for (const route of routes) {
      test(`${route} has no axe violations`, async ({ page }) => {
        await page.goto(route);
        const results = await new AxeBuilder({ page }).analyze();
        expect(results.violations).toEqual([]);
      });
    }
  });
}
