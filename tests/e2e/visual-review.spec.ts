import { test } from "@playwright/test";

/**
 * Manual visual review helper (not a regression test): saves screenshots of the
 * product pages at the QA widths in light and dark mode to SHOTS_DIR.
 * Run with: SHOTS_DIR=/tmp/shots npx playwright test visual-review
 */
const WIDTHS = [375, 430, 768, 1280, 1440];
const PAGES = ["/", "/dashboard", "/data", "/statistics", "/reports"];

test.skip(!process.env.SHOTS_DIR, "set SHOTS_DIR to capture screenshots");

test("capture product pages", async ({ page }) => {
  test.setTimeout(15 * 60_000);
  const dir = process.env.SHOTS_DIR!;
  await page.setViewportSize({ width: 375, height: 800 });
  await page.goto("/login");
  await page.screenshot({ path: `${dir}/login-375.png`, fullPage: true });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/login");
  await page.screenshot({ path: `${dir}/login-1440.png` });
  await page.getByLabel("Email").fill(process.env.E2E_EMAIL!);
  await page.getByLabel("Password", { exact: true }).fill(process.env.E2E_PASSWORD!);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForURL((url) => !url.pathname.startsWith("/login"));

  for (const mode of ["light", "dark"] as const) {
    await page.evaluate((m) => document.body.setAttribute("data-pc-theme", m), mode);
    for (const path of PAGES) {
      for (const width of WIDTHS) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(path);
        await page.evaluate((m) => document.body.setAttribute("data-pc-theme", m), mode);
        await page.waitForLoadState("networkidle").catch(() => undefined);
        await page.waitForTimeout(2800); // empty states fade in after 2 s
        const name = path === "/" ? "home" : path.slice(1);
        await page.screenshot({ path: `${dir}/${name}-${width}-${mode}.png` });
      }
    }
  }
});
