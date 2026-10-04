import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from '@playwright/test';

// Racine du dépôt, ancrée sur ce script : les captures atterrissent au bon
// endroit même si le script est lancé depuis un autre répertoire.
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const SHOTS = [
  { url: 'http://localhost:8765/', selector: '#collection', out: 'og.png' },
  { url: 'http://localhost:8765/democratie/', selector: '#tarifs', out: 'democratie/og.png' },
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });

for (const shot of SHOTS) {
  await page.goto(shot.url);
  await page.waitForLoadState('networkidle');
  await page.locator(shot.selector).screenshot({ path: path.join(ROOT, shot.out) });
  console.log(`Capture ${shot.out} sauvegardée (${shot.selector} sur ${shot.url})`);
}

await browser.close();
