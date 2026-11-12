import { expect, it } from "vitest";
import { createContent } from "./index";

it("seed content reads", async () => {
  const c = createContent();
  expect((await c.listWork()).length).toBe(1);
  expect((await c.listPosts("articles")).length).toBe(1);
  expect((await c.listPosts("musings")).length).toBe(1);
  expect((await c.listReleases()).length).toBe(1);
  expect((await c.getHome()).featuredWork).toEqual(["marketplace-checkout"]);
  await c.getAbout();
});
