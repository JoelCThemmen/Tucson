import { test, expect } from '@playwright/test';

test('compare navigation across pages', async ({ page }) => {
  // Test Dashboard page
  await page.goto('http://localhost:5173/app');
  await page.waitForLoadState('networkidle');
  
  const dashboardNav = await page.locator('nav').boundingBox();
  await page.screenshot({ path: 'dashboard-nav.png', fullPage: false });
  console.log('Dashboard nav:', dashboardNav);
  
  // Test Profile page
  await page.goto('http://localhost:5173/app/profile');
  await page.waitForLoadState('networkidle');
  
  const profileNav = await page.locator('nav').boundingBox();
  await page.screenshot({ path: 'profile-nav.png', fullPage: false });
  console.log('Profile nav:', profileNav);
  
  // Check if nav exists and is visible
  const navExists = await page.locator('nav').isVisible();
  console.log('Nav visible on profile:', navExists);
  
  // Get computed styles of the nav
  const navStyles = await page.locator('nav').evaluate(el => {
    const styles = window.getComputedStyle(el);
    return {
      position: styles.position,
      top: styles.top,
      left: styles.left,
      width: styles.width,
      zIndex: styles.zIndex,
      backgroundColor: styles.backgroundColor,
      opacity: styles.opacity,
      transform: styles.transform
    };
  });
  console.log('Nav styles:', navStyles);
  
  // Get the main content container position
  const mainContent = await page.locator('.min-h-screen').first().boundingBox();
  console.log('Main content position:', mainContent);
  
  // Check if they overlap
  if (dashboardNav && profileNav && mainContent) {
    console.log('Nav overlaps content:', profileNav.y + profileNav.height > mainContent.y);
  }
});