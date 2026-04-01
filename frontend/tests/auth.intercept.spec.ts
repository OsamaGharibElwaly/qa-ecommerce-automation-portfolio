import { test, expect } from "@playwright/test";

test("login submits expected payload", async ({ page }) => {
  await page.route("**/api/auth/login", async (route) => {
    const body = route.request().postDataJSON();
    expect(body).toEqual({
      email: "demo@example.com",
      password: "password123"
    });
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        message: "Login successful.",
        token: "mock-token",
        user: { id: 1, name: "Demo User", email: "demo@example.com" }
      })
    });
  });

  await page.goto("/login");
  await page.getByTestId("login-email-input").fill("demo@example.com");
  await page.getByTestId("login-password-input").fill("password123");
  await page.getByTestId("login-submit-button").click();
});
