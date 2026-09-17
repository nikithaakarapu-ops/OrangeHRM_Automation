import { defineConfig, devices } from '@playwright/test';
import { config } from './config/environment.config';
import { STORAGE_STATE_PATH } from './config/constants';

export default defineConfig({
  testDir: './tests',
  timeout: 4 * 60 * 1000, 
  expect: { timeout: 20 * 1000 },
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: config.baseUrl,
    headless: true,
    viewport: { width: 1440, height: 900 },
    video: 'on',
    screenshot: 'on',
    trace: 'retain-on-failure',
  },

  projects: [
    {
      name: 'setup',
      testMatch: /.*\.setup\.ts/,
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'chromium',
      dependencies: ['setup'],
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        storageState: STORAGE_STATE_PATH,
      },
    },
  ],
});
