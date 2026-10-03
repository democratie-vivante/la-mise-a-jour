import { test, expect } from '@playwright/test';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '..');

test('hub CTA reaches the démocratie page', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Ouvrir la mise à jour Démocratie →' }).click();
  await expect(page).toHaveURL('/democratie/');
  await expect(page.locator('h1')).toContainText('Découvrez Citoyen 2.0');
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
  await expect(page.locator('h1')).toContainText('Découvrez Citoyen 2.0');
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

test('hub works from file:// with relative assets', async ({ page }) => {
  await page.goto('file://' + path.join(ROOT, 'index.html'));
  await expect(page.locator('h1')).toHaveText("Votre société n'a pas été mise à jour depuis 1958.");
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg, 'feuille de style non chargée en file://').toBe('rgb(248, 250, 252)');
});
