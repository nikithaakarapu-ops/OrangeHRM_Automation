import fs from 'fs';
import { test as setup, expect } from '../fixtures/base-test';
import { LoginPage } from '../pages/login-page';
import { OrangeHrmApiClient } from '../api/orange-hrm-api-client';
import { config } from '../config/environment.config';
import { STORAGE_STATE_PATH, ESS_STORAGE_STATE_PATH, ESS_USER_PATH, USER_ROLES } from '../config/constants';
import { DateUtils } from '../utils/date-utils';
import { randomUUID } from 'crypto';

setup.describe.configure({ mode: 'serial' });

setup('Login to the Orange HRM application as Admin', async ({ page, loginPage, dashboardPage }) => {
  await loginPage.goto();
  await loginPage.login(config.username, config.password);
  await expect(page, 'Should navigate to dashboard after login').toHaveURL(/dashboard/);
  await expect(dashboardPage.dashboardHeading, 'Dashboard heading should be visible').toBeVisible();

  await page.context().storageState({ path: STORAGE_STATE_PATH });
});

setup('Create an ESS user and save its session', async ({ browser }) => {
  const uniqueSuffix = DateUtils.getCurrentTimeStamp("DDMMYYYYHHmmss")

  const ess = { employeeId: `E${randomUUID().replace(/-/g, '').slice(0, 8)}`, username: `ess.${uniqueSuffix}`, password: 'Automation@123' };

  const adminContext = await browser.newContext({ storageState: STORAGE_STATE_PATH });
  const adminApi = new OrangeHrmApiClient(adminContext.request);
  const employee = await (await adminApi.createEmployee('Ess', 'Automation', ess.employeeId)).json();
  console.log(`Response is : ${JSON.stringify(employee,null,2)}`);
  await adminApi.createSystemUser(ess.username, ess.password, USER_ROLES.ESS, employee.data.empNumber);
  await adminContext.close();
  fs.writeFileSync(ESS_USER_PATH, JSON.stringify(ess));

  const essContext = await browser.newContext();
  const essPage = await essContext.newPage();
  const essLogin = new LoginPage(essPage);
  await essLogin.goto();
  await essLogin.login(ess.username, ess.password);
  await expect(essPage, 'ESS user should reach the dashboard').toHaveURL(/dashboard/);
  await essContext.storageState({ path: ESS_STORAGE_STATE_PATH });
  await essContext.close();
});
