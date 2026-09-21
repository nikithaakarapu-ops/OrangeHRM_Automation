import { Locator, Page } from "@playwright/test";
import { BasePage } from "./base-page";

export interface LoginDetails {
  username: string;
  password: string;
  status: "Enabled" | "Disabled";
}

export interface NewEmployee {
  firstName: string;
  lastName: string;
  employeeId: string;
  profilePicture: string;
  loginDetails?: LoginDetails;
}

export class AddEmployeePage extends BasePage {
  readonly firstNameInput = this.page.locator('input[name="firstName"]');
  readonly lastNameInput = this.page.locator('input[name="lastName"]');
  readonly employeeIdInput = this.page
    .locator(".oxd-input-group", { hasText: "Employee Id" })
    .locator("input");
  readonly profilePictureInput = this.page.locator('input[type="file"]');
  readonly profilePicturePreview = this.page.locator("img.employee-image");
  readonly createLoginDetailsToggle = this.page.locator(".oxd-switch-input");
  readonly usernameInput = this.page
    .locator(".oxd-input-group", { hasText: "Username" })
    .locator("input");
  readonly passwordInput = this.page.locator('input[type="password"]').nth(0);
  readonly confirmPasswordInput = this.page.locator('input[type="password"]').nth(1);
  readonly saveButton = this.page.getByRole("button", { name: "Save" });

  constructor(page: Page) {
    super(page);
  }

  toastMessage(message: string): Locator {
    return this.page.locator(".oxd-toast", { hasText: message });
  }

  statusRadio(status: string): Locator {
    return this.page.locator(".oxd-radio-wrapper label", { hasText: status });
  }

  async addEmployee(employee: NewEmployee) {
    await this.fill(this.firstNameInput, employee.firstName);
    await this.fill(this.lastNameInput, employee.lastName);
    await this.fill(this.employeeIdInput, employee.employeeId);

    await this.uploadFile(this.profilePictureInput, employee.profilePicture);
    await this.expectAttribute(
      this.profilePicturePreview,
      "src",
      /^data:image/,
      "Uploaded picture preview should be shown",
    );

    if (employee.loginDetails) {
      await this.addLoginDetails(employee.loginDetails);
    }

    await this.click(this.saveButton);
  }

  async addLoginDetails(details: LoginDetails) {
    await this.click(this.createLoginDetailsToggle);
    await this.fill(this.usernameInput, details.username);
    await this.click(this.statusRadio(details.status));
    await this.fill(this.passwordInput, details.password);
    await this.fill(this.confirmPasswordInput, details.password);
  }

  async getEmpNumberFromUrl(): Promise<number> {
    await this.waitForUrl(/empNumber\/\d+/);
    return Number(this.getUrl().split("/").pop());
  }
}
