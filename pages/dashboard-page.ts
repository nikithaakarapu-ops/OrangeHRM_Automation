import { Locator, Page } from '@playwright/test';
import { BasePage } from './base-page';

export class DashboardPage extends BasePage {
  readonly dashboardHeading = this.page.getByRole('heading', { name: 'Dashboard' });
  readonly userDropdown = this.page.locator('.oxd-userdropdown-tab');
  readonly logoutMenuItem = this.page.getByRole('menuitem', { name: 'Logout' });
  readonly mainMenuItems = this.page.locator('.oxd-main-menu-item');

  constructor(page: Page) {
    super(page);
  }

  mainMenuItem(menuName: string): Locator {
    return this.page.locator('.oxd-main-menu-item', { hasText: menuName });
  }

  async goto() {
    await this.open('/web/index.php/dashboard/index');
  }

  async openMenu(menuName: string) {
    await this.click(this.mainMenuItem(menuName));
  }

  async logout() {
    await this.click(this.userDropdown);
    await this.click(this.logoutMenuItem);
  }
}
