import { test, expect } from "../fixtures/base-test";
import { config } from "../config/environment.config";
import { TAGS } from "../config/constants";

test.describe("Authentication Testcase", () => {

  test.use({ storageState: { cookies: [], origins: [] } });

  test("Admin can log in and log out", { tag: [TAGS.SMOKE] }, async ({ page, loginPage, dashboardPage }) => {
    await loginPage.goto();
    await loginPage.login(config.username, config.password);
    await expect(page, "Should navigate to dashboard after login").toHaveURL(/dashboard/);
    await expect(dashboardPage.dashboardHeading, "Dashboard heading should be visible").toBeVisible();

    await dashboardPage.logout();
    await expect(page, "Should be redirected to login page").toHaveURL(/auth\/login/);
    await expect(loginPage.loginButton, "Login button should be visible").toBeVisible();
  });

  test("Login is rejected with invalid credentials", { tag: [TAGS.SMOKE] }, async ({ page, loginPage }) => {
    await loginPage.goto();
    await loginPage.login(config.username, "invalid-password");
    await expect(loginPage.errorAlert, "Invalid credentials message should be shown").toHaveText("Invalid credentials");
    await expect(page, "Should stay on the login page").toHaveURL(/auth\/login/);
  });
});
