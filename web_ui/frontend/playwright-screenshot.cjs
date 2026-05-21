const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1400, height: 900 } });

  // Directly navigate to Trainer page
  await page.goto('http://localhost:5188/trainer', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForTimeout(3000);

  // Screenshot 1: collapsed state
  await page.screenshot({ path: '/tmp/trainer-collapsed.png', fullPage: true });

  // Click to expand Training Log
  await page.click('text=TRAINING LOG');
  await page.waitForTimeout(500);

  // Screenshot 2: expanded state
  await page.screenshot({ path: '/tmp/trainer-expanded.png', fullPage: true });

  console.log('Screenshots saved');
  await browser.close();
})();
