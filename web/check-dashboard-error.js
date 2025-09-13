import { chromium } from '@playwright/test';

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Capture console and network errors
  const errors = [];
  const requests = [];
  
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(msg.text());
    }
  });
  
  page.on('request', request => {
    if (request.url().includes('verification')) {
      requests.push({
        url: request.url(),
        method: request.method()
      });
    }
  });
  
  page.on('requestfailed', request => {
    if (request.url().includes('verification')) {
      console.log('Failed request:', request.url(), request.failure()?.errorText);
    }
  });
  
  await page.goto('http://localhost:5173/app');
  await page.waitForTimeout(3000);
  
  console.log('\nVerification requests:');
  requests.forEach(req => {
    console.log(`  ${req.method} ${req.url}`);
  });
  
  console.log('\nConsole errors:');
  errors.forEach(err => {
    console.log(' ', err);
  });
  
  await browser.close();
})();