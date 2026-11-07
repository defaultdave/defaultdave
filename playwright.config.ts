import { defineConfig } from "@playwright/test";

const port = "3100";

export default defineConfig({
  testDir: "e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env["CI"]),
  retries: process.env["CI"] ? 1 : 0,
  reporter: process.env["CI"] ? "github" : "list",
  use: {
    baseURL: `http://localhost:${port}`,
    trace: "off",
  },
  webServer: {
    command: `pnpm start --port ${port}`,
    url: `http://localhost:${port}`,
    reuseExistingServer: !process.env["CI"],
  },
});
