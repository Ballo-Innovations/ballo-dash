import { expect, test } from "@playwright/test";

/** K-02 account pages. Emails go to the local API's outbox, so links are not followed here. */
test.describe("account pages", () => {
  test("sign-up shows field errors, then confirms the email was sent", async ({ page }) => {
    await page.goto("/signup");
    await expect(page.getByRole("heading", { name: "Create your account" })).toBeVisible();
    await page.getByLabel("Company name").fill("Kafue Fibre");
    await page.getByLabel("First name").fill("Natasha");
    await page.getByLabel("Last name").fill("Banda");
    await page.getByLabel("Work email").fill("not-an-email");
    await page.getByLabel("Password", { exact: true }).fill("short");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByText("Enter a valid email address")).toBeVisible();
    await expect(page.getByText("Use at least 10 characters")).toBeVisible();

    const email = `e2e-${Date.now()}@example.test`;
    await page.getByLabel("Work email").fill(email);
    await page.getByLabel("Password", { exact: true }).fill("a long sturdy password");
    await page.getByLabel("Confirm password").fill("a different password");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByText("The passwords do not match")).toBeVisible();
    await page.getByLabel("Confirm password").fill("a long sturdy password");
    await page.getByRole("button", { name: "Create account" }).click();
    await expect(page.getByRole("heading", { name: "Check your inbox" })).toBeVisible();
    await expect(page.getByText(email)).toBeVisible();

    // Signing in before confirming explains what to do.
    await page.goto("/login");
    await page.getByLabel("Email").fill(email);
    await page.getByLabel("Password", { exact: true }).fill("a long sturdy password");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page.getByText("Confirm your email address first")).toBeVisible();
    await page.getByRole("button", { name: "Send the link again" }).click();
    await expect(page.getByRole("button", { name: "Link sent again" })).toBeDisabled();
  });

  test("login links to sign-up and password reset", async ({ page }) => {
    await page.goto("/login");
    await page.getByRole("link", { name: "Create an account" }).click();
    await expect(page).toHaveURL(/\/signup$/);
    await page.goto("/login");
    await page.getByRole("link", { name: "Forgot password?" }).click();
    await expect(page).toHaveURL(/\/forgot-password$/);
  });

  test("forgot password gives the same answer for any address", async ({ page }) => {
    await page.goto("/forgot-password");
    await page.getByLabel("Email").fill("nobody@example.test");
    await page.getByRole("button", { name: "Send reset link" }).click();
    await expect(page.getByText("If an account uses that address")).toBeVisible();
  });

  test("an invalid confirmation or reset link explains what to do", async ({ page }) => {
    await page.goto("/verify-email?token=" + "x".repeat(43));
    await expect(page.getByText("This link is invalid or has expired")).toBeVisible();
    await expect(page.getByRole("button", { name: "Send a new link" })).toBeVisible();

    await page.goto("/reset-password");
    await expect(page.getByText("This link is incomplete")).toBeVisible();

    await page.goto("/reset-password?token=" + "y".repeat(43));
    await page.getByLabel("New password", { exact: true }).fill("a brand new password");
    await page.getByLabel("Confirm new password").fill("something else entirely");
    await page.getByRole("button", { name: "Save and sign in" }).click();
    await expect(page.getByText("The passwords do not match")).toBeVisible();
    await page.getByLabel("Confirm new password").fill("a brand new password");
    await page.getByRole("button", { name: "Save and sign in" }).click();
    await expect(page.getByText("This link is invalid or has expired")).toBeVisible();
  });
});
