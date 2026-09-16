import { expect, test } from '@playwright/test';

const weekOne = 'Week 1 — Blue Line project';

async function expectLocalArtwork(page: import('@playwright/test').Page) {
  await expect.poll(() => page.locator('main img').evaluateAll(nodes =>
    nodes.every(node => {
      const img = node as HTMLImageElement;
      return img.complete && img.naturalWidth > 0 && new URL(img.src).origin === location.origin;
    }),
  )).toBe(true);
}

test('the map only shows Week 1, with no retired stops or lake decorations', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Leo’s Portfolio');
  await expect(page.getByRole('button', { name: /Line project/ })).toHaveCount(1);
  await expect(page.getByRole('button', { name: weekOne })).toBeVisible();
  await expect(page.locator('.station-label')).toHaveText('Week 1');
  await expect(page.getByText('TBD', { exact: true })).toHaveCount(0);
  await expect(page.getByText(/Lake|Michigan/)).toHaveCount(0);
  await expect(page.locator('img[src*="wave"], img[src*="coastline"], img[src*="station-halos"]')).toHaveCount(0);
  await expect(page.getByRole('navigation').getByRole('button', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
  await expectLocalArtwork(page);
  await page.screenshot({ path: '.reference/week-1-map-desktop.png', fullPage: true });
  expect(errors).toEqual([]);
});

test('About and Contact dialogs close with Escape and restore focus', async ({ page }) => {
  await page.goto('/');
  for (const name of ['About', 'Contact']) {
    const button = page.getByRole('navigation').getByRole('button', { name });
    await button.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByRole('dialog')).toContainText('coming soon');
    await page.keyboard.press('Escape');
    await expect(page.getByRole('dialog')).not.toBeVisible();
    await expect(button).toBeFocused();
  }
});

test('Week 1 opens the Figma page with matching route color, blank copy, and two image placeholders', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  const mapColor = await page.getByRole('button', { name: weekOne }).evaluate(node =>
    getComputedStyle(node).getPropertyValue('--route-color').trim());
  await page.getByRole('button', { name: weekOne }).click();
  await expect(page).toHaveURL(/#\/projects\/week-1$/);
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByRole('heading', { name: 'Week 1' })).toHaveCount(1);
  await expect(page.locator('.image-placeholder')).toHaveCount(2);
  await expect(page.locator('.project-content')).toHaveText('Week 1Back to map');
  await expect(page.locator('.project-title, .project-summary, .project-copy-space p')).toHaveCount(0);
  await expect(page.getByText(/View project|Source code|Project name|Image 0[12]|Lake|Michigan/)).toHaveCount(0);
  await expect(page.getByRole('navigation').locator('[aria-current]')).toHaveCount(0);
  expect(await page.locator('.project-canvas').evaluate(node =>
    getComputedStyle(node).getPropertyValue('--route-color').trim())).toBe(mapColor);
  await expect(page.locator('.project-route')).toHaveCSS('background-color', 'rgb(4, 127, 223)');
  await expectLocalArtwork(page);
  const images = page.locator('.image-placeholder');
  const first = await images.nth(0).boundingBox();
  const second = await images.nth(1).boundingBox();
  expect(first).toEqual({ x: 164, y: 404, width: 800, height: 400 });
  expect(second).toEqual({ x: 164, y: 922, width: 800, height: 400 });
  await page.screenshot({ path: '.reference/week-1-project-desktop.png', fullPage: true });
  await page.getByRole('link', { name: 'Back to map' }).last().click();
  await expect(page.getByRole('button', { name: weekOne })).toBeFocused();
  await expect(page.locator('.map-canvas')).toBeVisible();
  expect(errors).toEqual([]);
});

test('Projects lists the available projects separately and supports browser history and direct links', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('navigation').getByRole('button', { name: 'Projects' }).click();
  await expect(page).toHaveURL(/#\/projects$/);
  await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible();
  await expect(page.getByRole('navigation').getByRole('button', { name: 'Projects' })).toHaveAttribute('aria-current', 'page');
  await expect(page.locator('.project-card')).toHaveCount(1);
  await page.getByRole('button', { name: 'Week 1 Blue Line' }).click();
  await expect(page.locator('.project-canvas')).toBeVisible();
  await page.reload();
  await expect(page.locator('.image-placeholder')).toHaveCount(2);
  await page.goBack();
  await expect(page.getByRole('button', { name: 'Week 1 Blue Line' })).toBeFocused();
  await page.goForward();
  await expect(page.locator('.project-canvas')).toBeVisible();
  await page.getByRole('navigation').getByRole('button', { name: 'Contact' }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Close panel' }).click();
  await expect(page.locator('.project-canvas')).toBeVisible();
  await page.getByRole('navigation').getByRole('button', { name: 'Home' }).click();
  await expect(page.locator('.map-canvas')).toBeVisible();
});

for (const width of [320, 390, 713, 768, 900, 1440]) {
  test(`the map, project, and project index fit a ${width}px viewport`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const map = await page.locator('.map-canvas').boundingBox();
    expect(map).not.toBeNull();
    expect(Math.abs(map!.width - map!.height)).toBeLessThan(1);
    await page.getByRole('button', { name: weekOne }).focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.project-canvas')).toBeVisible();
    await expect(page.getByRole('link', { name: 'Back to map' }).first()).toBeFocused();
    if (width <= 900) {
      const back = await page.getByRole('link', { name: 'Back to map' }).first().boundingBox();
      const scene = await page.locator('.project-scene').boundingBox();
      const footer = await page.getByRole('link', { name: 'Back to map' }).last().boundingBox();
      expect(back!.y + back!.height).toBeLessThanOrEqual(scene!.y);
      expect(footer!.y).toBeGreaterThanOrEqual(scene!.y + scene!.height);
    }
    for (const image of await page.locator('.image-placeholder').all()) {
      const box = await image.boundingBox();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(width);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    if (width === 390) {
      await page.screenshot({ path: '.reference/week-1-project-mobile.png', fullPage: true });
    }
    await page.getByRole('link', { name: 'Back to map' }).first().click();
    await expect(page.getByRole('button', { name: weekOne })).toBeFocused();
    await page.getByRole('navigation').getByRole('button', { name: 'Projects' }).click();
    await expect(page.locator('.project-card')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });
}
