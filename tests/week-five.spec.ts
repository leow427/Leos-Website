import { expect, test } from '@playwright/test';

for (const width of [390, 1440]) {
  test(`Week 5 media and textured helmet work at ${width}px`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/');
    const stop = page.getByRole('button', { name: 'Week 5 — Orange Line project' });
    const map = (await page.locator('.map-canvas').boundingBox())!;
    const station = (await stop.boundingBox())!;
    expect(station.x + station.width / 2).toBeCloseTo(map.x + 951 * map.width / 1254, 1);
    await page.screenshot({ path: `.reference/week-5-map-${width}.png`, fullPage: true });
    await stop.click();
    await expect(page).toHaveURL(/#\/projects\/week-5$/);
    await expect(page.locator('.project-route path')).toHaveCSS('stroke', 'rgb(253, 130, 26)');
    await expect(page.locator('.project-photo')).toHaveCount(8);
    await expect(page.locator('.project-collage .project-photo')).toHaveCount(4);
    for (const photo of await page.locator('.project-collage .project-media').all()) {
      const frame = (await photo.boundingBox())!;
      expect(frame.width / frame.height).toBeCloseTo(3 / 4, 2);
    }
    await expect(page.getByRole('link', { name: 'https://woven-lamp-studio.vercel.app', exact: true })).toHaveAttribute('href', 'https://woven-lamp-studio.vercel.app');
    await expect.poll(() => page.locator('.project-photo').evaluateAll(images => images.every(image => (image as HTMLImageElement).naturalWidth > 0))).toBe(true);
    const video = page.locator('video');
    await video.scrollIntoViewIfNeeded();
    await video.evaluate(async node => { (node as HTMLVideoElement).muted = true; await (node as HTMLVideoElement).play(); });
    await expect.poll(() => video.evaluate(node => (node as HTMLVideoElement).currentTime)).toBeGreaterThan(0.1);
    await video.evaluate(node => (node as HTMLVideoElement).pause());
    const viewer = page.locator('.model-viewer-shell');
    await viewer.scrollIntoViewIfNeeded();
    await expect(viewer).toHaveAttribute('data-status', 'ready', { timeout: 30000 });
    const canvas = viewer.locator('canvas');
    const original = await canvas.screenshot();
    const box = (await canvas.boundingBox())!;
    await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
    await page.mouse.down();
    await page.mouse.move(box.x + box.width / 2 + 65, box.y + box.height / 2 + 20, { steps: 12 });
    await page.mouse.up();
    await expect.poll(async () => (await canvas.screenshot()).equals(original)).toBe(false);
    await page.getByRole('button', { name: 'Reset 3D view' }).click();
    await page.screenshot({ path: `.reference/week-5-helmet-${width}.png` });
    await page.screenshot({ path: `.reference/week-5-project-${width}.png`, fullPage: true });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    await page.getByRole('link', { name: 'Back to map' }).last().click();
    await expect(stop).toBeFocused();
    expect(errors).toEqual([]);
  });
}

test('helmet download failure is recoverable', async ({ page }) => {
  await page.route('**/media/week-5/helmet/10_12_2026.obj', route => route.abort(), { times: 1 });
  await page.goto('/#/projects/week-5');
  const viewer = page.locator('.model-viewer-shell');
  await viewer.scrollIntoViewIfNeeded();
  await expect(viewer).toHaveAttribute('data-status', 'error', { timeout: 30000 });
  await page.getByRole('button', { name: 'Try again' }).click();
  await expect(viewer).toHaveAttribute('data-status', 'ready', { timeout: 30000 });
});
