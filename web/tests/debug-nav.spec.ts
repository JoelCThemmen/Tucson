import { test, expect } from '@playwright/test';

test('debug navigation issue', async ({ page }) => {
  // Go directly to profile page
  await page.goto('http://localhost:5173/app/profile');
  await page.waitForLoadState('networkidle');
  
  // Log the current URL
  const url = page.url();
  console.log('Current URL:', url);
  
  // Get the Profile link element
  const profileLink = page.locator('a[href="/app/profile"]').first();
  
  // Get its classes
  const classes = await profileLink.getAttribute('class');
  console.log('Profile link classes:', classes);
  
  // Check if it exists
  const exists = await profileLink.isVisible();
  console.log('Profile link visible:', exists);
  
  // Get the nav element's bounding box
  const navBox = await page.locator('nav').first().boundingBox();
  console.log('Nav position:', navBox);
  
  // Take a screenshot
  await page.screenshot({ path: 'profile-page.png', fullPage: true });
  
  // Also log what the location.pathname would be in React
  const pathname = await page.evaluate(() => window.location.pathname);
  console.log('Window pathname:', pathname);
});