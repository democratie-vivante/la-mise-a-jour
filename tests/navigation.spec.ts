import { test, expect } from '@playwright/test';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '..');

test('hub CTA reaches the démocratie page', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Ouvrir la migration Démocratie →' }).click();
  await expect(page).toHaveURL('/democratie/');
  await expect(page.locator('h1')).toHaveText('La démocratie tourne en v5.0 depuis 1958.');
});

test('brand returns from démocratie to the hub', async ({ page }) => {
  await page.goto('/democratie/');
  await page.locator('.brand').click();
  await expect(page).toHaveURL('/');
  await expect(page.locator('h1')).toHaveText("Votre société n'a pas été mise à jour depuis 1958.");
});

// Contingence : Vite ne redirige pas `/democratie` vers `/democratie/`, il lui sert
// son repli SPA (le hub) avec un 200. C'est un écart du serveur de test, pas du
// site : la redirection slash final vers la forme canonique est assurée par
// GitHub Pages, pas par Vite. Les URL canoniques ne sont pas touchées.
test('/democratie/ serves the démocratie page', async ({ page }) => {
  const resp = await page.goto('/democratie/');
  expect(resp!.status(), '/democratie/ : statut').toBeLessThan(400);
  await expect(page.locator('h1')).toHaveText('La démocratie tourne en v5.0 depuis 1958.');
});

test('hub faq opens one item at a time', async ({ page }) => {
  await page.goto('/');
  const items = page.locator('.faq-item');
  await items.nth(0).locator('summary').click();
  await expect(items.nth(0)).toHaveAttribute('open', '');
  await items.nth(1).locator('summary').click();
  await expect(items.nth(1)).toHaveAttribute('open', '');
  await expect(items.nth(0)).not.toHaveAttribute('open', '');
});

test('objections open one at a time on the démocratie page', async ({ page }) => {
  await page.goto('/democratie/');
  const items = page.locator('.obj-item');
  await expect(items).toHaveCount(6);
  await items.nth(0).locator('summary').click();
  await expect(items.nth(0)).toHaveAttribute('open', '');
  await items.nth(1).locator('summary').click();
  await expect(items.nth(1)).toHaveAttribute('open', '');
  await expect(items.nth(0)).not.toHaveAttribute('open', '');
});

test('tooltip opens on click and closes on Escape', async ({ page }) => {
  await page.goto('/');
  const button = page.locator('#principe .info-btn').first();
  await button.click();
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  const tipId = await button.getAttribute('aria-controls');
  await expect(page.locator(`#${tipId}`)).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator(`#${tipId}`)).toBeHidden();
});

test('beta tooltips stay inside the viewport', async ({ page }) => {
  await page.goto('/democratie/');
  for (const id of ['tip-tirage-b', 'tip-collegial-b', 'tip-futures-b']) {
    const button = page.locator(`[aria-controls="${id}"]`);
    await button.click();
    const box = await page.locator(`#${id}`).boundingBox();
    const width = page.viewportSize()!.width;
    expect(box, `${id} invisible`).not.toBeNull();
    expect(box!.x, `${id} déborde à gauche`).toBeGreaterThanOrEqual(-1);
    expect(box!.x + box!.width, `${id} déborde à droite`).toBeLessThanOrEqual(width + 1);
    await page.keyboard.press('Escape');
  }
});

test('hub works from file:// with relative assets', async ({ page }) => {
  await page.goto('file://' + path.join(ROOT, 'index.html'));
  await expect(page.locator('h1')).toHaveText("Votre société n'a pas été mise à jour depuis 1958.");
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg, 'feuille de style non chargée en file://').toBe('rgb(248, 250, 252)');
});

test('skip link moves focus into the main region', async ({ page }) => {
  await page.goto('/democratie/');
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
});

test('mobile navigation reaches the sections', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/democratie/');
  await expect(page.locator('.site-nav')).toBeHidden();
  const details = page.locator('.nav-mobile');
  await details.locator('summary').click();
  await expect(details).toHaveAttribute('open', '');
  await details.getByRole('link', { name: 'Matrice' }).click();
  await expect(page).toHaveURL(/#tarifs$/);
  await expect(details).not.toHaveAttribute('open', '');
});

test('mobile anchor lands below the sticky header', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/democratie/');
  await page.evaluate(() => {
    document.documentElement.style.scrollBehavior = 'auto';
  });
  await page.locator('.nav-mobile summary').click();
  await page.locator('.nav-mobile-list a', { hasText: 'Matrice' }).click();
  const visible = await page.evaluate(() => {
    const title = document.getElementById('tarifs-title')!.getBoundingClientRect();
    const header = document.querySelector('.site-header')!.getBoundingClientRect();
    return title.top >= header.bottom;
  });
  expect(visible, 'le titre de section passe sous l’en-tête collant').toBe(true);
});

test('mobile header stays on two lines', async ({ page }) => {
  for (const width of [320, 390]) {
    await page.setViewportSize({ width, height: 844 });
    for (const path of ['/', '/democratie/']) {
      await page.goto(path);
      const height = await page.evaluate(
        () => document.querySelector('.site-header')!.getBoundingClientRect().height
      );
      expect(height, `en-tête trop haut à ${width}px sur ${path}`).toBeLessThan(130);
      await expect(page.locator('.site-header .btn-sm')).toBeVisible();
    }
  }
});

test('mobile menu stays inside the viewport', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 844 });
  await page.goto('/');
  await page.locator('.nav-mobile summary').click();
  const box = (await page.locator('.nav-mobile-list').boundingBox())!;
  expect(box.x).toBeGreaterThanOrEqual(0);
  expect(box.x + box.width).toBeLessThanOrEqual(320);
});

test('desktop navigation stays inline', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto('/democratie/');
  await expect(page.locator('.site-nav')).toBeVisible();
  await expect(page.locator('.nav-mobile')).toBeHidden();
});

test('mobile matrix scrolls sideways as one surface', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/democratie/');
  const grid = page.locator('.pricing-grid');
  const overflow = await grid.evaluate((el) => ({
    x: getComputedStyle(el).overflowX,
    sw: el.scrollWidth,
    cw: el.clientWidth,
  }));
  expect(overflow.x).toBe('auto');
  expect(overflow.sw).toBeGreaterThan(overflow.cw);
  const pageOverflow = await page.evaluate(
    () => document.documentElement.scrollWidth > window.innerWidth
  );
  expect(pageOverflow, 'la page déborde horizontalement').toBe(false);
});
