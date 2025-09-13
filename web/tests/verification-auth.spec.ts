import { test, expect } from '@playwright/test';

test.describe('Verification Authentication', () => {
  test('should load verification status page without authentication errors', async ({ page }) => {
    // Navigate to verification status page
    await page.goto('http://localhost:5173/verification/status');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check that the page loaded without errors
    const title = await page.locator('h1').first();
    await expect(title).toBeVisible();
    await expect(title).toContainText('Verification Status');
    
    // Check that no error messages are displayed
    const errorMessages = page.locator('text=/error|failed|unauthorized/i');
    const errorCount = await errorMessages.count();
    expect(errorCount).toBe(0);
    
    // Check that the verification content is visible
    const content = page.locator('.bg-white').first();
    await expect(content).toBeVisible();
    
    // Take a screenshot for manual review
    await page.screenshot({ path: 'verification-status-auth.png', fullPage: true });
  });
  
  test('should load verification wizard without authentication errors', async ({ page }) => {
    // Navigate to verification wizard
    await page.goto('http://localhost:5173/verification');
    
    // Wait for page to load
    await page.waitForLoadState('networkidle');
    
    // Check that the wizard loaded
    const wizard = page.locator('.max-w-4xl');
    await expect(wizard).toBeVisible();
    
    // Check that the step content is visible
    const stepContent = page.locator('h2').first();
    await expect(stepContent).toBeVisible();
    
    // Take a screenshot for manual review
    await page.screenshot({ path: 'verification-wizard-auth.png', fullPage: true });
  });
});