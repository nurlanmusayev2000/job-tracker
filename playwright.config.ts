import { defineConfig, devices } from "@playwright/test";

// The smoke test runs against the real static export, served under the same
// base path that GitHub Pages uses, so a broken asset path is caught here.
const port = 4173;
const basePath = "/job-tracker";
const baseURL = `http://localhost:${port}${basePath}/`;

export default defineConfig({
  testDir: "./e2e",
  // Fail in CI if a test was left with `test.only`.
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL,
    trace: "on-first-retry",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  // Build the site and serve the `out/` folder before the tests start.
  webServer: {
    command: "npm run build && node scripts/serve-export.mjs",
    url: baseURL,
    env: { PAGES_BASE_PATH: basePath, PORT: String(port) },
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
