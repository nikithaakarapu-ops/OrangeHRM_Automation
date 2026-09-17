import path from "path";
import { test, expect } from "../fixtures/base-test";
import { verifyEqual, verifyStatus } from "../utils/assertions";
import { DateUtils } from "../utils/date-utils";
import employees from "../data/employee-data.json";
import { STATUS_CODES } from "../config/constants";

test.describe("Employee Lifecycle Management", () => {
  employees.forEach((data, index) => {
    const uniqueSuffix = DateUtils.getCurrentTimeStamp("DDMMYYYYHHmmss");
    const isLastEmployee = index === employees.length - 1;
    const employee = {
      firstName: data.firstName + uniqueSuffix,
      lastName: data.lastName + uniqueSuffix,
      employeeId: `E${index}${Date.now().toString().slice(-8)}`,
      profilePicture: path.resolve(data.profilePicture),
    };

    test(data.testName + index, async ({page, dashboardPage, addEmployeePage,
        pimPage, orangeHrmApi, loginPage}) => {
        let empNumber = 0;

        await test.step("1. Open the dashboard as a logged-in user", async () => {
          await dashboardPage.goto();
          await expect(page,"Saved session should open the dashboard").toHaveURL(/dashboard/);
          await expect(dashboardPage.dashboardHeading,"Dashboard heading should be visible",).toBeVisible();
        });

        await test.step("2. Add a new employee", async () => {
          await dashboardPage.openMenu("PIM");
          await pimPage.navigateToTab("Add Employee");
          await addEmployeePage.addEmployee(employee);
          await expect(addEmployeePage.toastMessage("Successfully Saved"),'Toast "Successfully Saved" should appear').toBeVisible();
          empNumber = await addEmployeePage.getEmpNumberFromUrl();

          await pimPage.navigateToTab("Employee List");
          await pimPage.searchByEmployeeId(employee.employeeId);
          const row = await pimPage.getRowData(employee.employeeId);
          verifyEqual(row.id, employee.employeeId, "Employee Id in the list");
          verifyEqual(row.firstName,employee.firstName,"First name in the list");
          verifyEqual(row.lastName, employee.lastName, "Last name in the list");
        });

        await test.step("3. Validate the employee information through API", async () => {
          const employeeResponse = await orangeHrmApi.getEmployeeInfo(employee.employeeId);
          verifyStatus(employeeResponse.status(),STATUS_CODES.OK,"Status code is mismatching");
          const employeeBody = await employeeResponse.json();
          verifyEqual(employeeBody.data[0].lastName,employee.lastName, "Last name is mismatching in the API response");
          verifyEqual(employeeBody.data[0].firstName,employee.firstName,"First name is mismatching in the API response");
          verifyEqual(employeeBody.data[0].employeeId,employee.employeeId,"Employee Id is mismatching in the API response");
        });

        await test.step("4. Update employment status and job details", async () => {
          await pimPage.navigateToTab("Employee List");
          await pimPage.searchByEmployeeId(employee.employeeId);
          await pimPage.openEmployee(employee.employeeId);
          await pimPage.openJobTab();
          await pimPage.updateJobDetails(data.jobTitle, data.employmentStatus);
          await pimPage.gotoJobDetails(empNumber);
          await expect(pimPage.dropdownValue("Job Title"),"Job Title should be saved").toHaveText(data.jobTitle);
          await expect(pimPage.dropdownValue("Employment Status"),"Employment Status should be saved").toHaveText(data.employmentStatus);

          await pimPage.navigateToTab("Employee List");
          await pimPage.searchByEmployeeId(employee.employeeId);
          const row = await pimPage.getRowData(employee.employeeId);
          verifyEqual(row.employmentStatus,data.employmentStatus,"Employment Status in the list");
          verifyEqual(row.jobTitle, data.jobTitle, "Job Title in the list");
        });

        await test.step("5. Validate the job and employee details through API", async () => {
          const employeeResponse = await orangeHrmApi.getEmployeeInfo(employee.employeeId);
          verifyStatus(employeeResponse.status(),STATUS_CODES.OK,"Status code is mismatching");
          const employeeBody = await employeeResponse.json();
          verifyEqual(employeeBody.data[0].empStatus.name,data.employmentStatus,"Employment status is mismatching in the API response");
          verifyEqual(employeeBody.data[0].jobTitle.title,data.jobTitle,"Job Title is mismatching in the API response");
        });

        await test.step("6. Delete the employee", async () => {
          await pimPage.deleteEmployee(employee.employeeId);
          await pimPage.navigateToTab("Employee List");
          await pimPage.searchByEmployeeId(employee.employeeId);
          await expect(pimPage.noRecordsFoundMessage,"Deleted employee should not be found in UI").toBeVisible();
        });

        await test.step("7. Validate the delete employee API response", async () => {
          const employeeDeleteResponse = await orangeHrmApi.getEmployeeInfo(employee.employeeId);
          const employeeDeleteBody = await employeeDeleteResponse.json();
          verifyStatus(employeeDeleteResponse.status(),STATUS_CODES.OK,"Status code is mismatching");
          verifyEqual(employeeDeleteBody.meta.total,0,"Employee not deleted correctly");
        });

        if (isLastEmployee) {
          await test.step("8. Logout after the final data set", async () => {
            await dashboardPage.logout();
            await expect(page, "Should be redirected to login page").toHaveURL(/auth\/login/,);
            await expect(loginPage.loginButton,"Login button should be visible").toBeVisible();
          });
        }
      },
    );
  });
});
