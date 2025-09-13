import { test, expect } from '@playwright/test';

test.describe('Currency Formatting in Verification Wizard', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to verification page
    await page.goto('http://localhost:5173/app/verification');
  });

  test('should format currency inputs with commas', async ({ page }) => {
    // Click on Income-based verification
    await page.getByRole('button', { name: /Income-based Verification/i }).click();
    
    // Test Annual Income field
    const incomeInput = page.locator('input[placeholder="200,000"]');
    await incomeInput.fill('250000');
    await incomeInput.blur();
    await expect(incomeInput).toHaveValue('250,000');
    
    // Clear and test with larger number
    await incomeInput.clear();
    await incomeInput.fill('1500000');
    await incomeInput.blur();
    await expect(incomeInput).toHaveValue('1,500,000');
    
    // Go back and test Net Worth fields
    await page.getByRole('button', { name: /Back/i }).click();
    await page.getByRole('button', { name: /Net Worth Verification/i }).click();
    
    // Test Net Worth field
    const netWorthInput = page.locator('input[placeholder="1,000,000"]');
    await netWorthInput.fill('2500000');
    await netWorthInput.blur();
    await expect(netWorthInput).toHaveValue('2,500,000');
    
    // Test Liquid Net Worth field
    const liquidNetWorthInput = page.locator('input[placeholder="500,000"]');
    await liquidNetWorthInput.fill('750000');
    await liquidNetWorthInput.blur();
    await expect(liquidNetWorthInput).toHaveValue('750,000');
  });

  test('should handle partial inputs and maintain formatting', async ({ page }) => {
    // Click on Income-based verification
    await page.getByRole('button', { name: /Income-based Verification/i }).click();
    
    const incomeInput = page.locator('input[placeholder="200,000"]');
    
    // Test typing progressively
    await incomeInput.fill('2');
    await expect(incomeInput).toHaveValue('2');
    
    await incomeInput.fill('25');
    await expect(incomeInput).toHaveValue('25');
    
    await incomeInput.fill('250');
    await expect(incomeInput).toHaveValue('250');
    
    await incomeInput.fill('2500');
    await expect(incomeInput).toHaveValue('2,500');
    
    await incomeInput.fill('25000');
    await expect(incomeInput).toHaveValue('25,000');
    
    await incomeInput.fill('250000');
    await expect(incomeInput).toHaveValue('250,000');
  });

  test('should handle clearing and re-entering values', async ({ page }) => {
    // Click on Net Worth verification
    await page.getByRole('button', { name: /Net Worth Verification/i }).click();
    
    const netWorthInput = page.locator('input[placeholder="1,000,000"]');
    
    // Enter value
    await netWorthInput.fill('1234567');
    await expect(netWorthInput).toHaveValue('1,234,567');
    
    // Clear and re-enter
    await netWorthInput.clear();
    await expect(netWorthInput).toHaveValue('');
    
    await netWorthInput.fill('9876543');
    await expect(netWorthInput).toHaveValue('9,876,543');
  });
});