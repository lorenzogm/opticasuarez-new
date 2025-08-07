import { test, expect } from '@playwright/test';

// Configure test to use production build
test.use({
  baseURL: 'http://localhost:3000/opticasuarez-new',
});

test.describe('Production Navigation Issue', () => {
  test.beforeAll(async () => {
    // This test requires a production server to be running
    // Run: npm run build && npm run start
  });

  test('should reproduce the navigation issue in production', async ({ page }) => {
    // Start on home page
    await page.goto('/');
    
    // Wait for page to load completely
    await expect(page).toHaveTitle(/Óptica Suárez/);
    
    // Add a client-side marker to detect if page reloads
    await page.evaluate(() => {
      (window as any).navigationTest = 'initial';
    });
    
    // Click on a navigation link
    await page.locator('nav').getByRole('link', { name: 'Servicios' }).click();
    
    // Check if we navigated to the correct page
    await expect(page).toHaveURL('/servicios');
    
    // The bug: check if the page was reloaded (client-side marker lost)
    const marker = await page.evaluate(() => (window as any).navigationTest);
    
    // If marker is undefined, it means the page was reloaded (full page navigation)
    // If marker is 'initial', it means client-side navigation worked
    if (marker === undefined) {
      console.log('BUG CONFIRMED: Full page reload occurred instead of client-side navigation');
    } else {
      console.log('Client-side navigation is working correctly');
    }
    
    // This assertion will help us verify the behavior
    expect(marker).toBe('initial');
  });
});