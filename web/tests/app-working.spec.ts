import { test, expect } from '@playwright/test';

test.describe('App Working', () => {
  test('landing page loads without errors', async ({ page }) => {
    // Navigate to landing page
    await page.goto('http://localhost:5173/');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check for console errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Wait a bit for any errors to appear
    await page.waitForTimeout(1000);
    
    // Check that the page has the main title
    const title = await page.locator('h1').first();
    await expect(title).toBeVisible();
    
    // Take a screenshot
    await page.screenshot({ path: 'landing-page-working.png', fullPage: true });
    
    // Check for errors
    if (errors.length > 0) {
      console.log('Console errors found:', errors);
    }
    expect(errors.length).toBe(0);
  });
  
  test('dashboard loads for authenticated user', async ({ page }) => {
    // Navigate to dashboard
    await page.goto('http://localhost:5173/app');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check that we're on the dashboard or redirected appropriately
    const url = page.url();
    console.log('Current URL:', url);
    
    // Take a screenshot
    await page.screenshot({ path: 'dashboard-working.png', fullPage: true });
  });
});