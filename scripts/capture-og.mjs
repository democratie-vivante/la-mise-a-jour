import { chromium } from '@playwright/test';

const SHOTS = [
  { url: 'http://localhost:8765/', selector: '#collection', out: 'og.png' },
  { url: 'http://localhost:8765/democratie/', selector: '#tarifs', out: 'democratie/og.png' },
];

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });

for (const shot of SHOTS) {
  await page.goto(shot.url);
  await page.waitForLoadState('networkidle');
  await page.addStyleTag({ content: '.site-header { display: none !important; }' });
  await page.locator(shot.selector).screenshot({ path: shot.out });
  console.log(`Capture ${shot.out} sauvegardée (${shot.selector} sur ${shot.url})`);
}

await browser.close();
