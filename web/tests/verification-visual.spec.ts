import { test, expect } from '@playwright/test';

test.describe('Verification Visual Test', () => {
  test('capture verification wizard current state', async ({ page }) => {
    // Navigate to verification wizard
    await page.goto('http://localhost:5173/verification');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Wait a bit for any dynamic content
    await page.waitForTimeout(2000);
    
    // Take a screenshot of whatever is on the page
    await page.screenshot({ path: 'verification-wizard-current.png', fullPage: true });
    
    // Log what we see
    const bodyText = await page.locator('body').textContent();
    console.log('Page content:', bodyText?.substring(0, 500));
    
    // Check if there are any visible elements
    const visibleElements = await page.locator('*:visible').count();
    console.log('Visible elements count:', visibleElements);
  });
});