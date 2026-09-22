import { expect, test } from '@playwright/test';
import type { Locator, Page } from '@playwright/test';
import type { ModelViewerElement } from '@google/model-viewer';

const weekOne = 'Week 1 — Blue Line project';
const weekTwo = 'Week 2 — Brown Line project';

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

test('the map shows both weekly stops, restored waves, and no lake label', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Leo’s Projects');
  await expect(page.getByRole('button', { name: /Line project/ })).toHaveCount(2);
  await expect(page.getByRole('button', { name: weekOne })).toBeVisible();
  await expect(page.locator('.station-label')).toHaveText(['Week 1', 'Week 2']);
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

test('Contact dialog closes with Escape and restores focus', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('navigation').getByRole('button', { name: 'About' })).toHaveCount(0);
  const button = page.getByRole('navigation').getByRole('button', { name: 'Contact' });
  await button.focus();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('dialog')).toBeVisible();
  await expect(page.getByRole('dialog')).toContainText('Contact me however! Ill respond faster on instagram though');
  await expect(page.getByRole('dialog')).toContainText('Email: walshleo427@gmail.com');
  await expect(page.getByRole('dialog')).toContainText('Instagram: l_.walsh');
  await page.keyboard.press('Escape');
  await expect(page.getByRole('dialog')).not.toBeVisible();
  await expect(button).toBeFocused();
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
  await expect(page.getByRole('heading', { name: 'This is my click fit design!' })).toBeVisible();
  await expect(page.getByText('My gaming laptop was dramatic one day', { exact: false })).toBeVisible();
  await expect(page.getByText('I did kind of cheat though.', { exact: false })).toBeVisible();
  await expect(page.getByText(/View project|Source code|Project name|Image 0[12]|Lake|Michigan/)).toHaveCount(0);
  await expect(page.getByRole('navigation').locator('[aria-current]')).toHaveCount(0);
  expect(await page.locator('.project-canvas').evaluate(node =>
    getComputedStyle(node).getPropertyValue('--route-color').trim())).toBe(mapColor);
  await expect(page.locator('.project-route path')).toHaveCSS('stroke', 'rgb(4, 127, 223)');
  await expectLocalArtwork(page);
  const mediaBoxes = await page.locator('.project-media').evaluateAll(elements => elements.map((element) => {
    const box = element.getBoundingClientRect();
    return { x: box.x, y: box.y, width: box.width, height: box.height };
  }));
  expect(mediaBoxes[0].x).toBeCloseTo(mediaBoxes[1].x, 2);
  expect(mediaBoxes[1].x).toBeCloseTo(mediaBoxes[2].x, 2);
  expect(mediaBoxes[0].y).toBeLessThan(mediaBoxes[1].y);
  expect(mediaBoxes[1].y).toBeLessThan(mediaBoxes[2].y);
  for (const box of mediaBoxes) expect(box.width / box.height).toBeCloseTo(16 / 9, 2);
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
  await expect(page.locator('.project-card')).toHaveCount(2);
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
      expect(footer!.y + footer!.height).toBeLessThanOrEqual(scene!.y + scene!.height);
    } else {
      await expectFigmaBox(page, page.getByRole('navigation'), { x: 366, y: 17, width: 488, height: 60 });
      await expectFigmaBox(page, page.locator('.back-to-map-top'), { x: 48, y: 92, width: 160, height: 44 });
      await expectFigmaBox(page, page.locator('.back-to-map-top img'), { x: 48, y: 102, width: 24, height: 24 });
      const model = await page.locator('.project-media').last().boundingBox();
      const footer = await page.getByRole('link', { name: 'Back to map' }).last().boundingBox();
      expect(footer!.y).toBeGreaterThanOrEqual(model!.y + model!.height);
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
    await expect(page.locator('.project-card').first()).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
  });
}

for (const project of ['week-1', 'week-2']) {
  test(`${project} model rotates, zooms, and resets`, async ({ page }) => {
    await page.goto(`/#/projects/${project}`);
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
}

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


test('Week 2 sits on the Brown Line at Week 1’s height and restores its map focus', async ({ page }) => {
  await page.goto('/');
  const first = (await page.getByRole('button', { name: weekOne }).boundingBox())!;
  const second = (await page.getByRole('button', { name: weekTwo }).boundingBox())!;
  const map = (await page.locator('.map-canvas').boundingBox())!;
  expect(Math.abs(first.y - second.y)).toBeLessThan(1);
  expect(second.x + second.width / 2).toBeCloseTo(map.x + 556 * map.width / 1254, 1);
  await page.getByRole('button', { name: weekTwo }).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#\/projects\/week-2$/);
  await expect(page).toHaveTitle('Week 2 — Leo’s Website');
  await expect(page.locator('.project-route path')).toHaveCSS('stroke', 'rgb(133, 79, 15)');
  await page.getByRole('link', { name: 'Back to map' }).first().click();
  await expect(page.getByRole('button', { name: weekTwo })).toBeFocused();
  await page.screenshot({ path: '.reference/week-2-map-desktop.png', fullPage: true });
});

for (const width of [320, 390, 768, 1440]) {
  test(`Week 2 shows only previewable media and fits a ${width}px screen`, async ({ page, request }) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/#/projects/week-2');
    await expect(page.getByRole('heading', { name: 'Week 2', exact: true })).toHaveCount(1);
    await expect(page.locator('.project-photo')).toHaveCount(3);
    await expect(page.locator('.project-media')).toHaveCount(4);
    await expect(page.locator('.project-introduction h2')).toHaveCount(0);
    await expect(page.locator('.project-introduction p')).toHaveText("While this is a very simple design, it was hard to get the form factor I liked the most right. The idea is a little CTA tracker powered by an AMOLED display + ESP32 module I found online. I've also been wanting to learn how to use BLE for communication instead of Wi-Fi, so I am hoping this project could make great use of it.");
    await expect(page.locator('.project-image-block').first().locator('.project-reflection')).toHaveText("I mocked up and drew this little CTA UI in pixelart.com, and then did some \"poor man's physics\" to try to get the look I wanted, basing the frost on what a resin printer can realistically do. So while it was super easy to design, I had to go through like 5 form factors and frosted appearances before I got the case and UI to look how I wanted it to. And like I said, I love simplicity.");
    await expect(page.getByRole('heading', { name: 'Design files' })).toHaveCount(0);
    await expect(page.getByRole('link', { name: /^Download / })).toHaveCount(0);
    await expectLocalArtwork(page);
    await expectModelLoaded(page);
    expect(await page.locator('model-viewer').evaluate(node => (node as ModelViewerElement).src)).toMatch(/week-2\/tracker\.glb$/);
    const imageSources = await page.locator('.project-photo').evaluateAll(images => images.map(image => (image as HTMLImageElement).src));
    const modelSource = await page.locator('model-viewer').evaluate(node => (node as ModelViewerElement).src!);
    for (const source of [...imageSources, modelSource]) {
      const response = await request.get(source);
      expect(response.ok(), source).toBe(true);
      expect((await response.body()).length).toBeGreaterThan(1000);
    }
    const content = (await page.locator('.project-content').boundingBox())!;
    const scene = (await page.locator('.project-scene').boundingBox())!;
    const route = (await page.locator('.project-route').boundingBox())!;
    expect(content.y + content.height).toBeLessThan(scene.y + scene.height);
    expect(content.y + content.height).toBeLessThan(route.y + route.height);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    for (const item of await page.locator('.project-media').all()) {
      const box = (await item.boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
    }
    if (width === 390 || width === 1440) {
      await page.screenshot({ path: `.reference/week-2-project-${width}.png`, fullPage: true });
    }
    await page.getByRole('navigation').getByRole('button', { name: 'Projects' }).click();
    await expect(page.getByRole('button', { name: 'Week 2 Brown Line' })).toBeVisible();
    await page.getByRole('button', { name: 'Week 2 Brown Line' }).click();
    await expect(page).toHaveURL(/#\/projects\/week-2$/);
    await expect(page.locator('.project-canvas')).toBeFocused();
    await page.goBack();
    await expect(page.getByRole('button', { name: 'Week 2 Brown Line' })).toBeFocused();
    expect(errors).toEqual([]);
  });
}
