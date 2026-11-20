import { defineConfig, devices } from "@playwright/test";

/**
 * End-to-end tests. Locally they start `next dev` against the database in
 * .env (local only; the global setup refuses remote databases unless
 * E2E_BASE_URL points at an already running deployment).
 */
const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3100";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: [["list"]],
  globalSetup: "./tests/e2e/global-setup.ts",
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: process.env.E2E_BASE_URL
    ? undefined
    : {
        // Production server: run `npm run build` first. Matches what users get and
        // avoids dev-mode compile delays (and a dev server rewriting .next).
        command: "npx next start -p 3100",
        url: `${baseURL}/login`,
        reuseExistingServer: !process.env.CI,
        timeout: 180_000,
      },
});
