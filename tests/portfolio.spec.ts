import { expect, test } from '@playwright/test';

test('the approved map loads with complete local artwork and no runtime errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Leo’s Portfolio');
  await expect(page.getByRole('button', { name: /Line project/ })).toHaveCount(5);
  await expect(page.getByRole('navigation').getByRole('button', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
  await expect.poll(() => page.locator('.map-canvas img').evaluateAll(nodes =>
    nodes.every(node => {
      const img = node as HTMLImageElement;
      return img.complete && img.naturalWidth > 0 && new URL(img.src).origin === location.origin;
    }),
  )).toBe(true);
  expect(errors).toEqual([]);
});

test('each navigation panel opens, closes with Escape, and restores focus', async ({ page }) => {
  await page.goto('/');
  for (const name of ['About', 'Projects', 'Contact']) {
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

test('station links open the project panel and its return button closes it', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Blue Line project — coming soon' }).click();
  await expect(page.getByRole('dialog')).toContainText('Next stop: new projects.');
  await page.getByRole('button', { name: 'Back to the map' }).click();
  await expect(page.getByRole('dialog')).not.toBeVisible();
});

for (const width of [320, 390, 768, 1440]) {
  test(`the map fits a ${width}px viewport and the menu remains usable`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    const dimensions = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, viewport: window.innerWidth }));
    expect(dimensions.scroll).toBeLessThanOrEqual(dimensions.viewport);
    const map = await page.locator('.map-canvas').boundingBox();
    expect(map).not.toBeNull();
    expect(Math.abs(map!.width - map!.height)).toBeLessThan(1);
    await page.getByRole('navigation').getByRole('button', { name: 'Contact' }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByRole('button', { name: 'Close panel' }).click();
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });
}
