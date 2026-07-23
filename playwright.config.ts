import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  timeout: 30_000,
  use: {
    baseURL: 'http://127.0.0.1:4187',
    trace: 'retain-on-failure',
  },
  webServer: {
    command: 'PORT=4187 npm run start',
    port: 4187,
    reuseExistingServer: process.env.PW_REUSE_SERVER === '1',
    timeout: 30_000,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['iPhone 13'], browserName: 'chromium' } },
  ],
});
