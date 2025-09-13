import { test, expect } from '@playwright/test';

/**
 * CRITICAL VISUAL LAYOUT TESTS
 * These tests catch the obvious UI mistakes that keep getting missed
 */

test.describe('Visual Layout Checker - Catches Obvious UI Issues', () => {
  
  test('CRITICAL: Check for text hidden under navigation', async ({ page }) => {
    const pagesToCheck = [
      '/verification/status',
      '/verification',
      '/app',
    ];
    
    for (const url of pagesToCheck) {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      
      // Get navigation bar details
      const nav = page.locator('nav').first();
      const navBox = await nav.boundingBox();
      
      if (navBox) {
        // Check if nav is fixed/sticky
        const navPosition = await nav.evaluate(el => 
          window.getComputedStyle(el).position
        );
        
        if (navPosition === 'fixed' || navPosition === 'sticky') {
          // Find the first heading
          const firstHeading = page.locator('h1, h2').first();
          const headingBox = await firstHeading.boundingBox();
          
          if (headingBox) {
            // CRITICAL CHECK: Heading should not overlap with nav
            const isHidden = headingBox.y < (navBox.y + navBox.height);
            
            if (isHidden) {
              // Take screenshot of the issue
              await page.screenshot({ 
                path: `layout-error-${url.replace(/\//g, '-')}.png`,
                fullPage: false,
                clip: {
                  x: 0,
                  y: 0,
                  width: 1280,
                  height: 200
                }
              });
              
              throw new Error(`
                🚨 CRITICAL LAYOUT ERROR on ${url}:
                Main heading is HIDDEN under the navigation bar!
                Nav bottom: ${navBox.y + navBox.height}px
                Heading top: ${headingBox.y}px
                
                FIX: Add pt-20 or pt-24 to the main content container
              `);
            }
            
            // Check minimum spacing
            const spacing = headingBox.y - (navBox.y + navBox.height);
            expect(spacing).toBeGreaterThanOrEqual(20);
          }
        }
      }
    }
  });
  
  test('Check for empty or blank pages', async ({ page }) => {
    const pagesToCheck = [
      '/verification/status',
      '/verification',
    ];
    
    for (const url of pagesToCheck) {
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      
      // Check if page has actual content
      const bodyText = await page.locator('body').innerText();
      const wordCount = bodyText.split(/\s+/).filter(word => word.length > 0).length;
      
      if (wordCount < 10) {
        await page.screenshot({ 
          path: `blank-page-${url.replace(/\//g, '-')}.png`,
          fullPage: true 
        });
        
        throw new Error(`
          🚨 BLANK PAGE ERROR on ${url}:
          Page has only ${wordCount} words - it's essentially blank!
          
          FIX: Add actual content to the component
        `);
      }
      
      // Check for form inputs on wizard pages
      if (url.includes('verification') && !url.includes('status')) {
        const formInputs = await page.locator('input, select, textarea').count();
        
        if (formInputs === 0) {
          throw new Error(`
            🚨 MISSING FORM ERROR on ${url}:
            Verification wizard has NO form inputs!
            
            FIX: Add the actual form fields to the wizard
          `);
        }
      }
    }
  });
  
  test('Check responsive design breakpoints', async ({ page }) => {
    const viewports = [
      { width: 375, height: 667, name: 'mobile' },
      { width: 768, height: 1024, name: 'tablet' },
      { width: 1280, height: 720, name: 'desktop' }
    ];
    
    const url = '/verification/status';
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.goto(url);
      await page.waitForLoadState('networkidle');
      
      // Check for horizontal scroll (bad responsive design)
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      
      if (hasHorizontalScroll) {
        await page.screenshot({ 
          path: `responsive-error-${viewport.name}.png`,
          fullPage: true 
        });
        
        throw new Error(`
          🚨 RESPONSIVE DESIGN ERROR at ${viewport.width}px:
          Page has horizontal scroll - content is cut off!
          
          FIX: Check for fixed widths, use responsive classes
        `);
      }
      
      // Check mobile menu on small screens
      if (viewport.width < 768) {
        const mobileMenuButton = await page.locator('button').filter({ 
          has: page.locator('.sr-only:has-text("menu")') 
        }).isVisible().catch(() => false);
        
        if (!mobileMenuButton) {
          throw new Error(`
            🚨 MOBILE MENU ERROR:
            No mobile menu button found on small screens!
            
            FIX: Ensure mobile menu button is visible on small viewports
          `);
        }
      }
    }
  });
  
  test('Check for overlapping elements', async ({ page }) => {
    await page.goto('/verification/status');
    await page.waitForLoadState('networkidle');
    
    // Check if any elements overlap
    const overlaps = await page.evaluate(() => {
      const elements = document.querySelectorAll('button, a, h1, h2, h3, p');
      const overlapping = [];
      
      for (let i = 0; i < elements.length; i++) {
        const rect1 = elements[i].getBoundingClientRect();
        
        for (let j = i + 1; j < elements.length; j++) {
          const rect2 = elements[j].getBoundingClientRect();
          
          // Check for overlap
          if (!(rect1.right < rect2.left || 
                rect1.left > rect2.right || 
                rect1.bottom < rect2.top || 
                rect1.top > rect2.bottom)) {
            overlapping.push({
              elem1: elements[i].tagName + ': ' + elements[i].textContent?.substring(0, 20),
              elem2: elements[j].tagName + ': ' + elements[j].textContent?.substring(0, 20)
            });
          }
        }
      }
      
      return overlapping;
    });
    
    if (overlaps.length > 0) {
      await page.screenshot({ 
        path: 'overlapping-elements.png',
        fullPage: true 
      });
      
      console.error('Overlapping elements found:', overlaps);
    }
    
    expect(overlaps.length).toBe(0);
  });
  
  test('Visual regression - take screenshots for manual review', async ({ page }) => {
    const pages = [
      { url: '/', name: 'landing' },
      { url: '/verification/status', name: 'verification-status' },
      { url: '/verification', name: 'verification-wizard' },
    ];
    
    for (const pageInfo of pages) {
      await page.goto(pageInfo.url);
      await page.waitForLoadState('networkidle');
      
      // Desktop screenshot
      await page.screenshot({ 
        path: `visual-check-${pageInfo.name}-desktop.png`,
        fullPage: true 
      });
      
      // Mobile screenshot
      await page.setViewportSize({ width: 375, height: 667 });
      await page.screenshot({ 
        path: `visual-check-${pageInfo.name}-mobile.png`,
        fullPage: true 
      });
      
      // Log for manual review
      console.log(`📸 Screenshot saved: visual-check-${pageInfo.name}-*.png`);
      console.log('   MANUAL CHECK REQUIRED: Review these screenshots for:');
      console.log('   - Text cut off or hidden');
      console.log('   - Proper spacing');
      console.log('   - Professional appearance');
      console.log('   - Mobile usability');
    }
  });
});