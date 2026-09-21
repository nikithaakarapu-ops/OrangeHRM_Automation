import { test } from "../fixtures/base-test";
import { OrangeHrmApiClient } from "../api/orange-hrm-api-client";
import { STORAGE_STATE_PATH, ESS_STORAGE_STATE_PATH, STATUS_CODES, TAGS } from "../config/constants";
import { verifyStatus } from "../utils/assertions";

test.describe("Role based Testcase", () => {
  test.use({ storageState: STORAGE_STATE_PATH });

  test("Admin sees all modules and can open User Management", { tag: [TAGS.RBAC, TAGS.REGRESSION] }, async ({
    page, dashboardPage, adminPage }) => {
    await dashboardPage.goto();
    await dashboardPage.expectTextArray(dashboardPage.mainMenuItems,[
      "Admin", "PIM", "Leave", "Time", "Recruitment", "My Info",
      "Performance", "Dashboard", "Directory", "Maintenance", "Claim", "Buzz",
    ],"Admin should see every menu");

    await adminPage.gotoSystemUsers();
    await adminPage.expectVisible(adminPage.systemUsersHeading,"System Users page should open");

    const response = await new OrangeHrmApiClient(page.request).getSystemUsers();
    await verifyStatus(response.status(), STATUS_CODES.OK,"Admin users API should be allowed for Admin");
  });
});

test.describe("ESS role", () => {
  test.use({ storageState: ESS_STORAGE_STATE_PATH });

  test("ESS sees only employee modules and is refused Admin access", { tag: [TAGS.RBAC, TAGS.REGRESSION] }, async ({
    page, dashboardPage, adminPage }) => {
    await dashboardPage.goto();
    await dashboardPage.expectTextArray(dashboardPage.mainMenuItems,[
      "Leave", "Time", "My Info", "Performance", "Dashboard", "Directory", "Claim", "Buzz",
    ],"ESS should see only the employee menus");
    for (const menu of ["Admin", "PIM", "Recruitment", "Maintenance"]) {
      await dashboardPage.expectCount(dashboardPage.mainMenuItem(menu),0,`${menu} menu should be hidden for ESS`);
    }

    await adminPage.gotoSystemUsers();
    await adminPage.expectVisible(adminPage.credentialRequiredMessage,"Admin page access should be refused");
    await adminPage.expectHidden(adminPage.systemUsersHeading,"System Users page should not be shown");

    const response = await new OrangeHrmApiClient(page.request).getSystemUsers();
    await verifyStatus(response.status(), STATUS_CODES.FORBIDDEN,"Admin users API should be forbidden for ESS");
  });
});
