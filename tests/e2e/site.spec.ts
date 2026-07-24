import { expect, test } from '@playwright/test';

test('navigates with HTMX and keeps one mounted lifecycle', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Enter the quiet between moments.' })).toBeVisible();
  await page.getByRole('link', { name: 'Prompt archive' }).click();
  await expect(page).toHaveURL(/\/prompt\/$/);
  await expect(page.getByRole('heading', { name: 'Reconstruction archive' })).toBeVisible();
  await page.getByRole('link', { name: 'Experience', exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('html')).toHaveAttribute('data-mount-count', '3');
  await expect(page.locator('html')).toHaveAttribute('data-active-lifecycles', '1');
});

test('submits and validates the inquiry accessibly', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Request a private walkthrough' }).click();
  await expect(page.getByText('Enter your name')).toBeVisible();
  await expect(page.getByLabel('Name')).toBeFocused();
  const invalidFieldTop = await page.getByLabel('Name').evaluate((element) => element.getBoundingClientRect().top);
  expect(invalidFieldTop).toBeGreaterThanOrEqual(0);
  expect(invalidFieldTop).toBeLessThan(await page.evaluate(() => window.innerHeight));
  await page.getByLabel('Name').fill('Morgan Lee');
  await page.getByLabel('Work email').fill('morgan@example.com');
  await page.getByLabel('Property or group').fill('North Shore Resort');
  await page.getByRole('button', { name: 'Request a private walkthrough' }).click();
  await expect(page.getByText('Request received')).toBeVisible();
});

test('chapter detail remains adjacent, visible, and focused after enhancement', async ({ page }) => {
  await page.goto('/');
  const trigger = page.getByRole('link', { name: 'Read the material note' }).first();
  await trigger.scrollIntoViewIfNeeded();
  await trigger.click();
  const note = page.locator('.chapter-note');
  await expect(note).toBeVisible();
  await expect(note).toBeFocused();
  const box = await note.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.y).toBeGreaterThanOrEqual(0);
  expect(box!.y).toBeLessThan(await page.evaluate(() => window.innerHeight));
});

test('core navigation and content work without JavaScript', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Enter the quiet between moments.' })).toBeVisible();
  await page.getByRole('link', { name: 'Prompt archive' }).click();
  await expect(page).toHaveURL(/\/prompt\/$/);
  await expect(page.getByRole('heading', { name: 'Reconstruction archive' })).toBeVisible();
  await context.close();
});

test('mobile layout has no horizontal overflow', async ({ page }) => {
  await page.goto('/');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
});

test('route transitions do not emit client errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));

  await page.goto('/');
  await page.getByRole('link', { name: 'Prompt archive' }).click();
  await page.getByRole('link', { name: 'Experience', exact: true }).click();
  expect(errors).toEqual([]);
});

test('scroll progress advances the native film without request flooding', async ({ page }) => {
  let filmRequests = 0;
  page.on('request', (request) => {
    if (request.url().includes('/media/spa-film.mp4')) filmRequests += 1;
  });

  await page.goto('/');
  const film = page.locator('[data-film]');
  await expect.poll(() => film.evaluate((video: HTMLVideoElement) => video.duration)).toBeGreaterThan(0);
  await page.mouse.wheel(0, 3000);
  await expect.poll(() => film.evaluate((video: HTMLVideoElement) => video.currentTime)).toBeGreaterThan(0.5);
  expect(filmRequests).toBeLessThan(10);
});

test('mobile film recovers when a paused video frame callback stalls', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'This regression covers touch-oriented mobile playback.');
  await page.addInitScript(() => {
    Object.defineProperty(HTMLVideoElement.prototype, 'requestVideoFrameCallback', {
      configurable: true,
      value: () => 1,
    });
    Object.defineProperty(HTMLVideoElement.prototype, 'cancelVideoFrameCallback', {
      configurable: true,
      value: () => undefined,
    });
  });

  await page.goto('/');
  const film = page.locator('[data-film]');
  await expect.poll(() => film.evaluate((video: HTMLVideoElement) => video.duration)).toBeGreaterThan(0);
  await page.evaluate(async () => {
    for (let y = 100; y <= 2400; y += 100) {
      window.scrollTo(0, y);
      await new Promise((resolve) => window.setTimeout(resolve, 20));
    }
  });
  await expect.poll(() => page.locator('[data-film-progress]').evaluate((element) => (
    Number.parseFloat(getComputedStyle(element).getPropertyValue('--film-progress'))
  ))).toBeGreaterThan(0.75);
  await expect.poll(() => film.evaluate((video: HTMLVideoElement) => video.currentTime)).toBeGreaterThan(0.5);
});

test('guided replay starts at the opening and pauses on manual input', async ({ page }) => {
  await page.goto('/');
  const controls = page.locator('[data-guided-tour]');
  await controls.scrollIntoViewIfNeeded();
  const destination = await controls.evaluate((element: HTMLElement) => element.offsetTop);
  await page.getByRole('button', { name: 'Play from start' }).click();
  await expect(page.locator('[data-tour-status]')).toContainText('Guided tour playing');
  await page.waitForTimeout(700);
  const guidedY = await page.evaluate(() => window.scrollY);
  expect(guidedY).toBeGreaterThan(0);
  expect(guidedY).toBeLessThan(destination);
  await page.mouse.wheel(0, 120);
  await expect(page.locator('[data-tour-status]')).toContainText('paused after manual input');
});

test('reduced motion exposes native film controls and disables guided movement', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  await expect(page.getByRole('button', { name: 'Play from start' })).toBeDisabled();
  await expect(page.getByRole('button', { name: 'Pause' })).toBeDisabled();
  await expect(page.locator('[data-tour-status]')).toContainText('disabled by your reduced-motion preference');
  await expect.poll(() => page.locator('[data-film]').evaluate((video: HTMLVideoElement) => video.controls)).toBe(true);
});
