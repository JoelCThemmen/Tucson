import { test, expect } from '@playwright/test';

test('debug navigation issues', async ({ page }) => {
  // Go to Dashboard
  await page.goto('http://localhost:5173/app');
  await page.waitForLoadState('networkidle');
  
  console.log('\n=== DASHBOARD PAGE ===');
  
  // Count all links with /app href
  const dashboardLinks = await page.locator('a[href="/app"]').all();
  console.log(`Found ${dashboardLinks.length} links with href="/app"`);
  for (let i = 0; i < dashboardLinks.length; i++) {
    const text = await dashboardLinks[i].textContent();
    const classes = await dashboardLinks[i].getAttribute('class');
    console.log(`  Link ${i + 1}: "${text?.trim()}" - classes: ${classes}`);
  }
  
  // Check Navigation component specifically
  const navDashboardLink = await page.locator('nav a[href="/app"]').first();
  const navDashboardClasses = await navDashboardLink.getAttribute('class');
  console.log(`\nNav Dashboard link classes: ${navDashboardClasses}`);
  
  // Go to Profile
  await page.goto('http://localhost:5173/app/profile');
  await page.waitForLoadState('networkidle');
  
  console.log('\n=== PROFILE PAGE ===');
  
  // Count all links with /app href on Profile page
  const profilePageDashboardLinks = await page.locator('a[href="/app"]').all();
  console.log(`Found ${profilePageDashboardLinks.length} links with href="/app"`);
  for (let i = 0; i < profilePageDashboardLinks.length; i++) {
    const text = await profilePageDashboardLinks[i].textContent();
    const classes = await profilePageDashboardLinks[i].getAttribute('class');
    const isInNav = await profilePageDashboardLinks[i].evaluate(el => el.closest('nav') !== null);
    console.log(`  Link ${i + 1}: "${text?.trim()}" - in nav: ${isInNav} - classes: ${classes}`);
  }
  
  // Check Navigation component specifically on Profile page
  const profileNavDashboardLink = await page.locator('nav a[href="/app"]').first();
  const profileNavDashboardClasses = await profileNavDashboardLink.getAttribute('class');
  console.log(`\nNav Dashboard link classes on Profile page: ${profileNavDashboardClasses}`);
  
  const profileNavProfileLink = await page.locator('nav a[href="/app/profile"]').first();
  const profileNavProfileClasses = await profileNavProfileLink.getAttribute('class');
  console.log(`Nav Profile link classes on Profile page: ${profileNavProfileClasses}`);
  
  // Check for h1 with Profile text
  const h1Count = await page.locator('h1').count();
  console.log(`\nFound ${h1Count} h1 elements`);
  for (let i = 0; i < h1Count; i++) {
    const h1Text = await page.locator('h1').nth(i).textContent();
    console.log(`  h1 ${i + 1}: "${h1Text?.trim()}"`);
  }
  
  // Check main element positioning
  const mainElement = await page.locator('main').first();
  const mainBox = await mainElement.boundingBox();
  console.log(`\nMain element position: y=${mainBox?.y}, height=${mainBox?.height}`);
  
  const navElement = await page.locator('nav').first();
  const navBox = await navElement.boundingBox();
  console.log(`Nav element position: y=${navBox?.y}, height=${navBox?.height}`);
  
  if (navBox && mainBox) {
    console.log(`Main starts at: ${mainBox.y}, Nav ends at: ${navBox.y + navBox.height}`);
    console.log(`Overlap? ${mainBox.y < navBox.y + navBox.height ? 'YES' : 'NO'}`);
  }
});