import { test, expect } from '@playwright/test';

test.describe('Prerendering Navigation Issue - Production Test', () => {
  // Use production server URL
  test.beforeEach(async ({ page }) => {
    // Set base URL for production server
    await page.goto('http://localhost:3000/opticasuarez-new/');
  });

  test('should work with client-side navigation after initial page load', async ({ page }) => {
    // Verify we're on the home page
    await expect(page).toHaveTitle(/Óptica Suárez/);
    
    // Add a client-side marker to detect page reloads
    await page.evaluate(() => {
      (window as any).navigationTestMarker = 'initial-load';
    });
    
    // Click on a navigation link - this should use client-side routing
    await page.locator('nav').getByRole('link', { name: 'Servicios' }).click();
    
    // Verify navigation worked
    await expect(page).toHaveURL(/\/servicios$/);
    await expect(page).toHaveTitle(/Servicios/);
    
    // Check if client-side navigation preserved our marker (no page reload)
    const marker = await page.evaluate(() => (window as any).navigationTestMarker);
    expect(marker).toBe('initial-load');
    
    // Try another navigation to ensure client-side routing continues to work
    await page.locator('nav').getByRole('link', { name: 'Quienes Somos' }).click();
    await expect(page).toHaveURL(/\/quienes-somos$/);
    await expect(page).toHaveTitle(/Quiénes somos/);
    
    // Check marker is still preserved
    const marker2 = await page.evaluate(() => (window as any).navigationTestMarker);
    expect(marker2).toBe('initial-load');
    
    // Navigate back to home
    await page.locator('nav').getByRole('link', { name: 'Inicio' }).click();
    await expect(page).toHaveURL(/\/opticasuarez-new\/?$/);
    await expect(page).toHaveTitle(/Óptica Suárez/);
    
    // Final check - marker should still be preserved
    const marker3 = await page.evaluate(() => (window as any).navigationTestMarker);
    expect(marker3).toBe('initial-load');
  });

  test('should handle navigation from prerendered pages', async ({ page }) => {
    // Test navigation starting from a prerendered page (not home)
    await page.goto('http://localhost:3000/opticasuarez-new/quienes-somos');
    await expect(page).toHaveTitle(/Quiénes somos/);
    
    // Add marker
    await page.evaluate(() => {
      (window as any).prerenderNavTest = 'from-prerendered-page';
    });
    
    // Navigate to another page
    await page.locator('nav').getByRole('link', { name: 'Servicios' }).click();
    await expect(page).toHaveURL(/\/servicios$/);
    await expect(page).toHaveTitle(/Servicios/);
    
    // Check if navigation was client-side (marker preserved)
    const marker = await page.evaluate(() => (window as any).prerenderNavTest);
    expect(marker).toBe('from-prerendered-page');
    
    // Navigate to home
    await page.locator('nav').getByRole('link', { name: 'Inicio' }).click();
    await expect(page).toHaveURL(/\/opticasuarez-new\/?$/);
    await expect(page).toHaveTitle(/Óptica Suárez/);
    
    // Final check
    const marker2 = await page.evaluate(() => (window as any).prerenderNavTest);
    expect(marker2).toBe('from-prerendered-page');
  });
});