import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/login-page';
import { DashboardPage } from '../pages/dashboard-page';
import { AddEmployeePage } from '../pages/add-employee-page';
import { PimPage } from '../pages/pim-page';
import { OrangeHrmApiClient } from '../api/orange-hrm-api-client';

type Fixtures = {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  addEmployeePage: AddEmployeePage;
  pimPage: PimPage;
  orangeHrmApi: OrangeHrmApiClient;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  dashboardPage: async ({ page }, use) => use(new DashboardPage(page)),
  addEmployeePage: async ({ page }, use) => use(new AddEmployeePage(page)),
  pimPage: async ({ page }, use) => use(new PimPage(page)),
  orangeHrmApi: async ({ page }, use) => use(new OrangeHrmApiClient(page.request)),
});

export { expect } from '@playwright/test';
