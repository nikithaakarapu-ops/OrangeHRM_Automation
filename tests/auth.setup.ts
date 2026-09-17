import { test as setup, expect } from '../fixtures/base-test';
import { config } from '../config/environment.config';
import { STORAGE_STATE_PATH } from '../config/constants';

setup('Login to the Orange HRM application as Admin', async ({ page, loginPage, dashboardPage }) => {
  await loginPage.goto();
  await loginPage.login(config.username, config.password);
  await expect(page, 'Should navigate to dashboard after login').toHaveURL(/dashboard/);
  await expect(dashboardPage.dashboardHeading, 'Dashboard heading should be visible').toBeVisible();

  await page.context().storageState({ path: STORAGE_STATE_PATH });
});
