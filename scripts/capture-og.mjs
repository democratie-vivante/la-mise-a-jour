import { chromium } from '@playwright/test';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto('http://localhost:8765');
await page.waitForLoadState('networkidle');
await page.addStyleTag({ content: '.site-header { display: none !important; }' });
await page.locator('#tarifs').screenshot({ path: 'og.png' });
await browser.close();
console.log('Capture og.png sauvegardée');
