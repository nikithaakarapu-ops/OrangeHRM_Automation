import { Locator, Page } from '@playwright/test';
import { BasePage } from './base-page';

const EMPLOYEE_TABLE_COLUMN = { id: 1, firstName: 2, lastName: 3, jobTitle: 4, employmentStatus: 5 };

export class PimPage extends BasePage {
  readonly employeeList = this.page.locator('.orangehrm-employee-list');
  readonly employeeIdSearchInput = this.page.locator('.oxd-input-group', { hasText: 'Employee Id' }).locator('input');
  readonly loadingSpinner = this.page.locator('.oxd-loading-spinner, .oxd-form-loader');
  readonly searchButton = this.page.getByRole('button', { name: 'Search' });
  readonly noRecordsFoundMessage = this.page.locator('.orangehrm-horizontal-padding', { hasText: 'No Records Found' });
  readonly saveButton = this.page.getByRole('button', { name: 'Save' }).first();
  readonly jobTab = this.page.locator('.orangehrm-tabs a', { hasText: 'Job' });
  readonly confirmDeleteButton = this.page.getByRole('button', { name: 'Yes, Delete' });

  constructor(page: Page) {
    super(page);
  }

  dropdownByLabel(label: string): Locator {
    return this.page.locator('.oxd-input-group', { hasText: label }).locator('.oxd-select-text');
  }

  dropdownValue(label: string): Locator {
    return this.page.locator('.oxd-input-group', { hasText: label }).locator('.oxd-select-text-input');
  }

  dropdownOption(option: string): Locator {
    return this.page.getByRole('option', { name: option, exact: true });
  }

  toastMessage(message: string): Locator {
    return this.page.locator('.oxd-toast', { hasText: message });
  }

  topNavTab(tabName: string): Locator {
    return this.page.locator('.oxd-topbar-body-nav-tab-item', { hasText: tabName });
  }

  employeeRow(employeeId: string): Locator {
    return this.page.locator('.oxd-table-card', { hasText: employeeId });
  }

  employeeIdCell(employeeId: string): Locator {
    return this.employeeRow(employeeId).getByRole('cell', { name: employeeId });
  }

  deleteButton(employeeId: string): Locator {
    return this.employeeRow(employeeId).locator('button:has(.bi-trash)');
  }

  async waitForLoading() {
    await this.waitForHidden(this.loadingSpinner);
  }

  async selectDropdown(label: string, option: string) {
    await this.click(this.dropdownByLabel(label));
    await this.click(this.dropdownOption(option));
  }

  async expectToast(message: string) {
    await this.expectVisible(this.toastMessage(message), `Toast "${message}" should appear`);
  }

  async navigateToTab(tabName: string) {
    await this.click(this.topNavTab(tabName));
  }

  async searchByEmployeeId(employeeId: string) {
    await this.expectVisible(this.employeeList);
    await this.fill(this.employeeIdSearchInput, employeeId);
    await this.expectValue(this.employeeIdSearchInput, employeeId);
    await this.waitForVisible(this.searchButton);
    await this.expectVisible(this.searchButton);
    await this.click(this.searchButton);
    await this.waitForLoading();
  }

  async getRowData(employeeId: string) {
    await this.expectVisible(this.employeeRow(employeeId), `Employee ${employeeId} should be in the list`);
    const cells = this.employeeRow(employeeId).getByRole('cell');
    return {
      id: await this.getText(cells.nth(EMPLOYEE_TABLE_COLUMN.id)),
      firstName: await this.getText(cells.nth(EMPLOYEE_TABLE_COLUMN.firstName)),
      lastName: await this.getText(cells.nth(EMPLOYEE_TABLE_COLUMN.lastName)),
      jobTitle: await this.getText(cells.nth(EMPLOYEE_TABLE_COLUMN.jobTitle)),
      employmentStatus: await this.getText(cells.nth(EMPLOYEE_TABLE_COLUMN.employmentStatus)),
    };
  }

  async openEmployee(employeeId: string) {
    await this.click(this.employeeIdCell(employeeId));
    await this.expectUrl(/viewPersonalDetails/);
    await this.waitForLoading();
  }

  async openJobTab() {
    await this.click(this.jobTab);
    await this.waitForLoading();
  }

  async gotoJobDetails(empNumber: number) {
    await this.open(`/web/index.php/pim/viewJobDetails/empNumber/${empNumber}`);
    await this.waitForLoading();
  }

  async updateJobDetails(jobTitle: string, employmentStatus: string) {
    await this.selectDropdown('Job Title', jobTitle);
    await this.selectDropdown('Employment Status', employmentStatus);
    await this.click(this.saveButton);
    await this.expectToast('Successfully Updated');
  }

  async updateEmploymentStatus(employmentStatus: string) {
    await this.selectDropdown('Employment Status', employmentStatus);
    await this.click(this.saveButton);
    await this.expectToast('Successfully Updated');
  }

  async deleteEmployee(employeeId: string) {
    await this.click(this.deleteButton(employeeId));
    await this.click(this.confirmDeleteButton);
    await this.expectToast('Successfully Deleted');
  }
}
