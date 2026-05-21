const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  await page.goto('http://localhost:5188/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);

  // Click the "Trainer" tab in the navigation
  await page.click('text=Trainer');
  await page.waitForTimeout(2000);

  // Screenshot 1: collapsed state
  await page.screenshot({ path: '/tmp/trainer-collapsed.png', fullPage: true });

  // Click to expand Training Log
  await page.click('text=Training Log');
  await page.waitForTimeout(500);

  // Screenshot 2: expanded state
  await page.screenshot({ path: '/tmp/trainer-expanded.png', fullPage: true });

  console.log('Screenshots saved');
  await browser.close();
})();
