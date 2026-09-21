import { Page } from '@playwright/test';
import { BasePage } from './base-page';

export class AdminPage extends BasePage {
  readonly systemUsersHeading = this.page.getByRole('heading', { name: 'System Users' });
  readonly credentialRequiredMessage = this.page.getByText('Credential Required');

  constructor(page: Page) {
    super(page);
  }

  async gotoSystemUsers() {
    await this.open('/web/index.php/admin/viewSystemUsers');
  }
}
