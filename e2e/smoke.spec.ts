import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("home renders a single h1 and has no axe violations", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toHaveCount(1);
  const results = await new AxeBuilder({ page }).analyze();
  expect(results.violations).toEqual([]);
});
