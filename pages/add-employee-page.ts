import { Locator, Page } from "@playwright/test";
import { BasePage } from "./base-page";

export interface NewEmployee {
  firstName: string;
  lastName: string;
  employeeId: string;
  profilePicture: string;
}

export class AddEmployeePage extends BasePage {
  readonly firstNameInput = this.page.locator('input[name="firstName"]');
  readonly lastNameInput = this.page.locator('input[name="lastName"]');
  readonly employeeIdInput = this.page
    .locator(".oxd-input-group", { hasText: "Employee Id" })
    .locator("input");
  readonly profilePictureInput = this.page.locator('input[type="file"]');
  readonly profilePicturePreview = this.page.locator("img.employee-image");
  readonly saveButton = this.page.getByRole("button", { name: "Save" });

  constructor(page: Page) {
    super(page);
  }

  toastMessage(message: string): Locator {
    return this.page.locator(".oxd-toast", { hasText: message });
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

    await this.click(this.saveButton);
  }

  async getEmpNumberFromUrl(): Promise<number> {
    await this.waitForUrl(/empNumber\/\d+/);
    return Number(this.getUrl().split("/").pop());
  }
}
