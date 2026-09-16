import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import type { ModelViewerElement } from '@google/model-viewer';

const weekOne = 'Week 1 — Blue Line project';

async function expectModelLoaded(page: Page) {
  await expect(page.locator('.model-viewer-shell')).toHaveAttribute('data-status', 'ready', { timeout: 20000 });
  await expect.poll(() => page.locator('model-viewer').evaluate(node => (node as ModelViewerElement).loaded)).toBe(true);
}

async function expectLocalArtwork(page: Page) {
  await expect.poll(() => page.locator('main img').evaluateAll(nodes =>
    nodes.every(node => {
      const img = node as HTMLImageElement;
      return img.complete && img.naturalWidth > 0 && new URL(img.src).origin === location.origin;
    }),
  )).toBe(true);
}

async function expectFigmaBox(page: Page, element: Locator, design: { x: number; y: number; width: number; height: number }) {
  const scene = (await page.locator('.project-scene').boundingBox())!;
  const box = (await element.boundingBox())!;
  const scale = scene.width / 1254;
  expect(Math.abs(box.x - scene.x - design.x * scale)).toBeLessThan(1);
  expect(Math.abs(box.y - scene.y - design.y * scale)).toBeLessThan(1);
  expect(Math.abs(box.width - design.width * scale)).toBeLessThan(1);
  expect(Math.abs(box.height - design.height * scale)).toBeLessThan(1);
}

test('the map shows only Week 1, restored waves, and no lake label', async ({ page }) => {
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
  await expect(page.locator('.shore-waves')).toHaveCount(1);
  await expect(page.locator('.lake-wave')).toHaveCount(0);
  await expect(page.locator('img[src*="station-halos"]')).toHaveCount(0);
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

test('Week 1 opens with matching route color, paired images, and an interactive model', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  const mapColor = await page.getByRole('button', { name: weekOne }).evaluate(node =>
    getComputedStyle(node).getPropertyValue('--route-color').trim());
  await page.getByRole('button', { name: weekOne }).click();
  await expect(page).toHaveURL(/#\/projects\/week-1$/);
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(page.getByRole('heading', { name: 'Week 1' })).toHaveCount(1);
  await expect(page.locator('.project-media')).toHaveCount(3);
  await expect(page.locator('.project-photo')).toHaveCount(2);
  await expect(page.locator('.project-photo').nth(0)).toHaveAttribute('src', /media\/razer-exploded\.png$/);
  await expect(page.locator('.project-photo').nth(1)).toHaveAttribute('src', /media\/razer-enclosure\.png$/);
  await expectModelLoaded(page);
  await expect(page.locator('.project-title, .project-summary, .project-copy-space p')).toHaveCount(0);
  await expect(page.getByText(/View project|Source code|Project name|Image 0[12]|Lake|Michigan/)).toHaveCount(0);
  await expect(page.getByRole('navigation').locator('[aria-current]')).toHaveCount(0);
  expect(await page.locator('.project-canvas').evaluate(node =>
    getComputedStyle(node).getPropertyValue('--route-color').trim())).toBe(mapColor);
  await expect(page.locator('.project-route')).toHaveCSS('background-color', 'rgb(4, 127, 223)');
  await expectLocalArtwork(page);
  const media = page.locator('.project-media');
  await expectFigmaBox(page, media.nth(0), { x: 164, y: 404, width: 800, height: 450 });
  await expectFigmaBox(page, media.nth(1), { x: 164, y: 874, width: 800, height: 450 });
  await expectFigmaBox(page, media.nth(2), { x: 164, y: 1442, width: 800, height: 450 });
  await expect(page.locator('.shore-waves')).toHaveCount(1);
  await expect(page.locator('.lake-wave')).toHaveCount(0);
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
  await expect(page.locator('.project-media')).toHaveCount(3);
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
    if (width > 600) expect(map!.y + map!.height).toBeLessThanOrEqual(900);
    await page.getByRole('button', { name: weekOne }).focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('.project-canvas')).toBeVisible();
    await expect(page.locator('.project-canvas')).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(page.getByRole('link', { name: 'Back to map' }).first()).toBeFocused();
    if (width <= 600) {
      const back = await page.getByRole('link', { name: 'Back to map' }).first().boundingBox();
      const scene = await page.locator('.project-scene').boundingBox();
      const footer = await page.getByRole('link', { name: 'Back to map' }).last().boundingBox();
      expect(back!.y + back!.height).toBeLessThanOrEqual(scene!.y);
      expect(footer!.y).toBeGreaterThanOrEqual(scene!.y + scene!.height);
    } else {
      await expectFigmaBox(page, page.getByRole('navigation'), { x: 366, y: 17, width: 488, height: 60 });
      await expectFigmaBox(page, page.locator('.back-to-map-top'), { x: 48, y: 92, width: 160, height: 44 });
      await expectFigmaBox(page, page.locator('.back-to-map-top img'), { x: 48, y: 102, width: 24, height: 24 });
      await expectFigmaBox(page, page.getByRole('link', { name: 'Back to map' }).last(), { x: 792, y: 2010, width: 172, height: 48 });
    }
    for (const image of await page.locator('.project-media').all()) {
      const box = await image.boundingBox();
      expect(box!.x).toBeGreaterThanOrEqual(0);
      expect(box!.x + box!.width).toBeLessThanOrEqual(width);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    if (width === 390) {
      await expectModelLoaded(page);
      await page.screenshot({ path: '.reference/week-1-project-mobile.png', fullPage: true });
    }
    if (width === 1440) {
      await expectModelLoaded(page);
      await page.screenshot({ path: '.reference/week-1-project-laptop.png', fullPage: true });
    }
    await page.getByRole('link', { name: 'Back to map' }).first().click();
    await expect(page.getByRole('button', { name: weekOne })).toBeFocused();
    await page.getByRole('navigation').getByRole('button', { name: 'Projects' }).click();
    await expect(page.locator('.project-card')).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });
}

test('the colored enclosure rotates, zooms, and resets', async ({ page }) => {
  await page.goto('/#/projects/week-1');
  await expectModelLoaded(page);
  const viewer = page.locator('model-viewer');
  await viewer.scrollIntoViewIfNeeded();
  const dimensions = await viewer.evaluate(node => (node as ModelViewerElement).getDimensions());
  // The selected colored assembly must frame independently from unused scene objects.
  expect(Math.max(dimensions.x, dimensions.y, dimensions.z)).toBeLessThan(50);
  const initial = await viewer.evaluate(node => (node as ModelViewerElement).getCameraOrbit());
  const box = (await viewer.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width / 2 + 100, box.y + box.height / 2 + 30, { steps: 12 });
  await page.mouse.up();
  await expect.poll(() => viewer.evaluate((node, theta) =>
    Math.abs((node as ModelViewerElement).getCameraOrbit().theta - theta), initial.theta)).toBeGreaterThan(.1);
  await page.mouse.wheel(0, -200);
  await expect.poll(() => viewer.evaluate(node => (node as ModelViewerElement).getCameraOrbit().radius)).toBeLessThan(initial.radius);
  await page.getByRole('button', { name: 'Reset 3D view' }).click();
  await expect.poll(() => viewer.evaluate(node => (node as ModelViewerElement).getCameraOrbit().theta)).toBeCloseTo(initial.theta, 2);
  await expect.poll(() => viewer.evaluate(node => (node as ModelViewerElement).getCameraOrbit().radius)).toBeCloseTo(initial.radius, 2);
});

test('a failed model download can be retried', async ({ page }) => {
  await page.route('**/media/razer.glb', route => route.abort(), { times: 1 });
  await page.goto('/#/projects/week-1');
  await expect(page.getByRole('alert')).toContainText('The 3D model couldn’t load.', { timeout: 20000 });
  await page.getByRole('button', { name: 'Try again' }).click();
  await expectModelLoaded(page);
});

test('the original shoreline animation plays and respects reduced motion', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'no-preference' });
  await page.goto('/assets/coastline.svg');
  const crest = page.locator('[id="Shoreline / inset contour"]');
  const start = await crest.evaluate(node => getComputedStyle(node).transform);
  await expect.poll(() => crest.evaluate(node => getComputedStyle(node).transform)).not.toBe(start);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(crest).toHaveCSS('animation-name', 'none');
});
