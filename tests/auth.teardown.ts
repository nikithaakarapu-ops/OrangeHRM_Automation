import fs from 'fs';
import { test as teardown } from '../fixtures/base-test';
import { config } from '../config/environment.config';
import { ESS_USER_PATH } from '../config/constants';

teardown('Delete the ESS user created for the run', async ({ loginPage, orangeHrmApi }) => {
  if (!fs.existsSync(ESS_USER_PATH)) return;
  const ess = JSON.parse(fs.readFileSync(ESS_USER_PATH, 'utf8'));

  await loginPage.goto();
  await loginPage.login(config.username, config.password);
  await loginPage.waitForUrl(/dashboard/);

  await orangeHrmApi.deleteEmployeeById(ess.employeeId);
  fs.unlinkSync(ESS_USER_PATH);
});
