import { expect, Locator, Page } from '@playwright/test';

type FilePaths = string | string[];

export class BasePage {
  constructor(protected readonly page: Page) {}

  async open(path: string) {
    await this.page.goto(path);
  }

  async reload() {
    await this.page.reload();
  }

  async waitForUrl(url: string | RegExp) {
    await this.page.waitForURL(url);
  }

  getUrl(): string {
    return this.page.url();
  }

  async click(locator: Locator) {
    await locator.click();
  }

  async doubleClick(locator: Locator) {
    await locator.dblclick();
  }

  async hover(locator: Locator) {
    await locator.hover();
  }

  async fill(locator: Locator, value: string) {
    await locator.fill(value);
  }

  async type(locator: Locator, value: string, delay = 50) {
    await locator.pressSequentially(value, { delay });
  }

  async clear(locator: Locator) {
    await locator.clear();
  }

  async press(locator: Locator, key: string) {
    await locator.press(key);
  }

  async check(locator: Locator) {
    await locator.check();
  }

  async uncheck(locator: Locator) {
    await locator.uncheck();
  }

  async selectOption(locator: Locator, option: string | string[]) {
    await locator.selectOption(option);
  }

  async uploadFile(locator: Locator, files: FilePaths) {
    await locator.setInputFiles(files);
  }

  async getText(locator: Locator): Promise<string> {
    return (await locator.innerText()).trim();
  }

  async getInputValue(locator: Locator): Promise<string> {
    return locator.inputValue();
  }

  async getAttribute(locator: Locator, name: string): Promise<string | null> {
    return locator.getAttribute(name);
  }

  async isVisible(locator: Locator): Promise<boolean> {
    return locator.isVisible();
  }

  async getCount(locator: Locator): Promise<number> {
    return locator.count();
  }

  async waitForVisible(locator: Locator) {
    await locator.first().waitFor({ state: 'visible' });
  }

  async waitForHidden(locator: Locator) {
    await expect(locator).toHaveCount(0);
  }

  async expectVisible(locator: Locator, message?: string) {
    await expect(locator, message).toBeVisible();
  }

  async expectHidden(locator: Locator, message?: string) {
    await expect(locator, message).toBeHidden();
  }

  async expectText(locator: Locator, text: string | RegExp, message?: string) {
    await expect(locator, message).toHaveText(text);
  }

  async expectContainsText(locator: Locator, text: string | RegExp, message?: string) {
    await expect(locator, message).toContainText(text);
  }

  async expectValue(locator: Locator, value: string | RegExp, message?: string) {
    await expect(locator, message).toHaveValue(value);
  }

  async expectAttribute(locator: Locator, name: string, value: string | RegExp, message?: string) {
    await expect(locator, message).toHaveAttribute(name, value);
  }

  async expectCount(locator: Locator, count: number, message?: string) {
    await expect(locator, message).toHaveCount(count);
  }

  async expectUrl(url: string | RegExp, message?: string) {
    await expect(this.page, message).toHaveURL(url);
  }

}
