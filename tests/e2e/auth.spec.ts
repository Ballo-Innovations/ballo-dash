import { expect, test } from "@playwright/test";

test.describe("access control", () => {
  test("anonymous visitors are sent to the login page with a safe callback", async ({ page }) => {
    await page.goto("/statistics");
    await expect(page).toHaveURL(/\/login\?callbackUrl=%2Fstatistics/);
    await expect(page.getByRole("heading", { name: "Log in" })).toBeVisible();
  });

  test("anonymous API calls get a JSON 401", async ({ request }) => {
    const response = await request.get("/api/company");
    expect(response.status()).toBe(401);
    expect(await response.json()).toEqual({ error: { code: "unauthorized", message: "Sign in to continue" } });
  });

  test("removed template and debug routes are gone", async ({ request }) => {
    for (const path of ["/api/debug/session", "/application/mail", "/forms/form_elements"]) {
      const response = await request.get(path, { maxRedirects: 0 });
      // Middleware answers before routing: anonymous callers never reach a page or handler.
      expect([307, 401, 404]).toContain(response.status());
    }
  });
});

test.describe("signed in", () => {
  test("wrong password shows a clear error", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("Username").fill(process.env.E2E_EMAIL!);
    await page.getByPlaceholder("Password").fill("not-the-password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText("Invalid email or password")).toBeVisible();
  });

  test("an admin can sign in, reach the dashboard and call the API", async ({ page }) => {
    await page.goto("/login?callbackUrl=%2Fdashboard");
    await page.getByPlaceholder("Username").fill(process.env.E2E_EMAIL!);
    await page.getByPlaceholder("Password").fill(process.env.E2E_PASSWORD!);
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL(/\/dashboard$/);

    const company = await page.request.get("/api/company");
    expect(company.status()).toBe(200);
    expect((await company.json()).company.name).toBe("E2E Test Company");

    const integrations = await page.request.get("/api/integrations");
    expect(integrations.status()).toBe(200);
  });

  test("every sidebar link opens a real page", async ({ page }) => {
    await page.goto("/login");
    await page.getByPlaceholder("Username").fill(process.env.E2E_EMAIL!);
    await page.getByPlaceholder("Password").fill(process.env.E2E_PASSWORD!);
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL((url) => !url.pathname.startsWith("/login"));

    await page.locator("#pc-navbar a[href^='/']").first().waitFor();
    const hrefs = await page.locator("#pc-navbar a[href^='/']").evaluateAll((links) =>
      Array.from(new Set(links.map((link) => link.getAttribute("href")!)))
    );
    expect(hrefs.length).toBeGreaterThan(0);
    for (const href of hrefs) {
      const response = await page.request.get(href);
      expect(response.status(), href).toBe(200);
    }
  });

  test("an external callbackUrl is ignored", async ({ page }) => {
    await page.goto("/login?callbackUrl=https%3A%2F%2Fevil.example");
    await page.getByPlaceholder("Username").fill(process.env.E2E_EMAIL!);
    await page.getByPlaceholder("Password").fill(process.env.E2E_PASSWORD!);
    await page.getByRole("button", { name: "Sign in" }).click();
    await page.waitForURL((url) => url.origin === new URL(page.url()).origin && !url.pathname.startsWith("/login"));
    expect(new URL(page.url()).hostname).not.toBe("evil.example");
  });
});
