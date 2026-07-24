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

test('home uses cache-busted 60fps all-intra film assets', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('[data-film]')).toHaveAttribute('poster', /\/media\/spa-film-60fps-poster\.jpg$/);
  await expect(page.locator('[data-film] source')).toHaveAttribute('src', /\/media\/spa-film-60fps-all-intra\.mp4$/);
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

test('mobile film stays on a viewport layer without sticky promotion', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'This regression covers the iOS mobile film layer.');
  await page.goto('/');
  const filmPlane = page.locator('.film-plane');
  const experience = page.locator('.experience-canvas');

  await expect(filmPlane).toHaveCSS('position', 'fixed');
  await expect(experience).toHaveCSS('background-color', 'rgba(0, 0, 0, 0)');
  await page.evaluate(() => window.scrollTo(0, 1800));
  await expect.poll(() => filmPlane.evaluate((element) => Math.round(element.getBoundingClientRect().top))).toBe(0);
});

test('mobile chapter surfaces keep the film visible behind the copy', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'This regression covers the narrow chapter treatment.');
  await page.goto('/');

  const styles = await page.locator('.chapter-panel:not(.chapter-panel--hero)').evaluateAll((panels) => (
    panels.map((panel) => {
      const copy = panel.querySelector<HTMLElement>('.chapter-panel__copy');
      const background = copy ? getComputedStyle(copy).backgroundColor : '';
      const alphaMatch = background.match(/\/\s*([\d.]+)\)/) ?? background.match(/rgba?\([^)]*,\s*([\d.]+)\)/);
      const blurMatch = copy ? getComputedStyle(copy).backdropFilter.match(/blur\(([\d.]+)px\)/) : null;
      return {
        panelBackground: getComputedStyle(panel).backgroundColor,
        alpha: Number.parseFloat(alphaMatch?.[1] ?? '1'),
        blur: Number.parseFloat(blurMatch?.[1] ?? '0'),
      };
    })
  ));

  expect(styles.every(({ panelBackground }) => panelBackground === 'rgba(0, 0, 0, 0)')).toBe(true);
  expect(Math.min(...styles.map(({ alpha }) => alpha))).toBeGreaterThanOrEqual(0.74);
  expect(Math.max(...styles.map(({ alpha }) => alpha))).toBeLessThanOrEqual(0.76);
  expect(Math.max(...styles.map(({ blur }) => blur))).toBe(0);
});

test('mobile keeps the film visible behind the complete home experience', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'This regression covers the mobile film canvas.');
  await page.goto('/');

  for (const selector of ['.return', '.guided-tour', '.inquiry', '.site-close']) {
    const section = page.locator(selector);
    await section.scrollIntoViewIfNeeded();
    await page.waitForTimeout(100);

    const state = await section.evaluate((element) => {
      const video = document.querySelector<HTMLVideoElement>('[data-film]');
      const videoRect = video?.getBoundingClientRect();
      const background = getComputedStyle(element).backgroundColor;
      const alphaMatch = background.match(/\/\s*([\d.]+)\)/) ?? background.match(/rgba?\([^)]*,\s*([\d.]+)\)/);
      return {
        filmVisible: Boolean(videoRect && videoRect.bottom > 0 && videoRect.top < window.innerHeight),
        surfaceAlpha: Number.parseFloat(alphaMatch?.[1] ?? '1'),
        backdropFilter: getComputedStyle(element).backdropFilter,
      };
    });

    expect(state.filmVisible, `${selector} should retain the film plane`).toBe(true);
    expect(state.surfaceAlpha, `${selector} should reveal the film`).toBeLessThanOrEqual(0.78);
    expect(state.backdropFilter, `${selector} should not flatten the mobile video layer`).toBe('none');
  }
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
    if (request.url().includes('/media/spa-film-60fps-all-intra.mp4')) filmRequests += 1;
  });

  await page.goto('/');
  const film = page.locator('[data-film]');
  await expect.poll(() => film.evaluate((video: HTMLVideoElement) => video.duration)).toBeGreaterThan(0);
  await page.mouse.wheel(0, 3000);
  await expect.poll(() => film.evaluate((video: HTMLVideoElement) => video.currentTime)).toBeGreaterThan(0.5);
  expect(filmRequests).toBeLessThan(10);
});

test('mobile film seeking does not depend on paused video frame callbacks', async ({ page }, testInfo) => {
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

test('mobile film produces a decoded frame after scrolling settles', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'This regression covers mobile video decoding.');
  await page.goto('/');
  const film = page.locator('[data-film]');
  await expect.poll(() => film.evaluate((video: HTMLVideoElement) => video.duration)).toBeGreaterThan(0);

  await page.evaluate(async () => {
    for (let y = 100; y <= 2400; y += 100) {
      window.scrollTo(0, y);
      await new Promise((resolve) => window.setTimeout(resolve, 20));
    }
  });
  await page.waitForTimeout(1000);

  const decodeState = await film.evaluate((video: HTMLVideoElement) => ({
    readyState: video.readyState,
    seeking: video.seeking,
  }));
  expect(decodeState.readyState).toBeGreaterThanOrEqual(2);
  expect(decodeState.seeking).toBe(false);
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
