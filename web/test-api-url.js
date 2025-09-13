const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Intercept network requests
  const requests = [];
  page.on('request', request => {
    if (request.url().includes('verification')) {
      requests.push({
        url: request.url(),
        method: request.method(),
        headers: request.headers()
      });
    }
  });
  
  // Go to dashboard
  await page.goto('http://localhost:5173/app');
  await page.waitForTimeout(3000);
  
  console.log('Verification API requests:');
  requests.forEach(req => {
    console.log(`  ${req.method} ${req.url}`);
  });
  
  await browser.close();
})();