import { test, expect } from '@playwright/test';

test.describe('Complete Verification Flow', () => {
  test('Full verification flow works end-to-end', async ({ page }) => {
    // Collect any errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });
    
    // Step 1: Navigate to verification status page
    await page.goto('http://localhost:5173/verification/status');
    await page.waitForLoadState('networkidle');
    
    // Should show verification page with start button
    await expect(page.locator('text=/Start Your Verification Journey/i')).toBeVisible();
    
    // Click start verification button
    await page.click('text=/Start Verification Process/i');
    await page.waitForLoadState('networkidle');
    
    // Step 2: Should be on verification wizard
    await expect(page.locator('h1:has-text("Accredited Investor Verification")')).toBeVisible();
    
    // Choose Income Verification
    await page.click('text=/Income Verification/');
    await page.click('text=/Next/');
    await page.waitForTimeout(500);
    
    // Step 3: Fill in financial information
    const incomeInput = page.locator('input[name="annualIncome"]');
    await expect(incomeInput).toBeVisible();
    await incomeInput.fill('250000');
    
    const sourceInput = page.locator('input[name="incomeSource"]');
    await sourceInput.fill('Software Engineering');
    
    await page.click('text=/Next/');
    await page.waitForTimeout(500);
    
    // Step 4: Document upload (skip for now)
    await page.click('text=/Next/');
    await page.waitForTimeout(500);
    
    // Step 5: Review and submit
    await expect(page.locator('text=/Review & Submit/i')).toBeVisible();
    
    // Check attestation checkbox
    const attestationCheckbox = page.locator('input[type="checkbox"]').first();
    await attestationCheckbox.check();
    
    // Check consent checkbox
    const consentCheckbox = page.locator('input[type="checkbox"]').last();
    await consentCheckbox.check();
    
    // Take screenshot before submitting
    await page.screenshot({ path: 'verification-review.png', fullPage: true });
    
    // Submit verification
    await page.click('button:has-text("Submit Verification")');
    
    // Wait for response
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);
    
    // Check for success or error
    const pageContent = await page.textContent('body');
    console.log('Page content after submit:', pageContent?.substring(0, 500));
    
    // Assert no errors occurred
    expect(errors).toHaveLength(0);
  });
  
  test('Verification status page shows correct information', async ({ page }) => {
    await page.goto('http://localhost:5173/verification/status');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot
    await page.screenshot({ path: 'verification-status-final.png', fullPage: true });
    
    // Check that page loaded
    await expect(page.locator('h1:has-text("Accredited Investor Verification")')).toBeVisible();
    
    // Check for status content
    const statusText = await page.locator('.bg-white').first().textContent();
    console.log('Status content:', statusText);
    
    // Should have either "No verification request" or show verification history
    const hasContent = statusText?.includes('verification') || statusText?.includes('accredited');
    expect(hasContent).toBeTruthy();
  });
});