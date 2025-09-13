const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Capture console messages
  const messages = [];
  page.on('console', msg => {
    messages.push({
      type: msg.type(),
      text: msg.text()
    });
  });
  
  // Capture page errors
  const errors = [];
  page.on('pageerror', error => {
    errors.push(error.message);
  });
  
  await page.goto('http://localhost:5173/verification');
  await page.waitForTimeout(2000);
  
  console.log('Console Messages:');
  messages.forEach(msg => {
    console.log(`  [${msg.type}] ${msg.text}`);
  });
  
  console.log('\nPage Errors:');
  errors.forEach(err => {
    console.log(`  ERROR: ${err}`);
  });
  
  // Check if React root has content
  const hasContent = await page.evaluate(() => {
    const root = document.getElementById('root');
    return root ? root.innerHTML.length > 0 : false;
  });
  
  console.log(`\nReact root has content: ${hasContent}`);
  
  // Get page text content
  const textContent = await page.textContent('body');
  console.log(`\nPage text content length: ${textContent.trim().length}`);
  
  await browser.close();
})();