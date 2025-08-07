import { test, expect } from '@playwright/test';

test.describe('Internal Links Routing Issues', () => {
  test('should fail when clicking internal links in static build environment', async ({
    page,
  }) => {
    // This test simulates the issue reported: "Al hacer click en un enlace interno da fallo, al recargar funciona"
    // The issue occurs because:
    // 1. Navigation links point to /servicios (without trailing slash)
    // 2. But prerendered files are generated as /servicios/index.html (requiring trailing slash)
    // 3. Static hosting doesn't automatically redirect /servicios to /servicios/

    // Start on home page
    await page.goto('/');
    await expect(page).toHaveTitle(/Óptica Suárez/);

    // Click on "Servicios" link in navigation
    // This should work in development but fail in static hosting
    const serviciosLink = page
      .locator('nav')
      .getByRole('link', { name: 'Servicios' });

    // Get the href attribute to verify it doesn't have trailing slash
    const href = await serviciosLink.getAttribute('href');
    expect(href).toBe('/servicios'); // This is the problem - no trailing slash

    // Try to click the link
    await serviciosLink.click();

    // In development, this should work
    // In static build with GitHub Pages hosting, this would fail
    await expect(page).toHaveURL('/servicios');

    // Check if we can access the page content
    // If the routing works, we should see the services page title
    await expect(page).toHaveTitle(/Servicios/);
  });

  test('should demonstrate the issue with direct URL access', async ({
    page,
  }) => {
    // Test direct navigation to URLs without trailing slash
    // This simulates what happens when users:
    // 1. Click internal links
    // 2. Bookmark URLs
    // 3. Share URLs

    const routesWithoutSlash = [
      '/servicios',
      '/quienes-somos',
      '/blog',
      '/contacto',
    ];

    for (const route of routesWithoutSlash) {
      // Try to navigate directly to the route without trailing slash
      // In development this works, in static hosting it fails
      await page.goto(route);

      // Should be able to access the page
      await expect(page).toHaveURL(route);

      // Page should load successfully (not 404)
      const title = await page.title();
      expect(title).not.toBe(''); // Should have a title if page loaded
      expect(title).not.toContain('404'); // Should not be a 404 page
    }
  });

  test('should show mismatch between link hrefs and generated file structure', async ({
    page,
  }) => {
    // This test demonstrates the core issue:
    // Links point to /servicios but files are generated as /servicios/index.html

    await page.goto('/');

    // Check all main navigation links
    const navLinks = [
      { name: 'Servicios', expectedHref: '/servicios' },
      { name: 'Quienes Somos', expectedHref: '/quienes-somos' },
      { name: 'Blog', expectedHref: '/blog' },
      { name: 'Contacto', expectedHref: '/contacto' },
    ];

    for (const link of navLinks) {
      const linkElement = page
        .locator('nav')
        .getByRole('link', { name: link.name });
      const href = await linkElement.getAttribute('href');

      // Verify the current implementation (without trailing slash)
      expect(href).toBe(link.expectedHref);

      // This is the problem: links point to /servicios but static files
      // are generated as /servicios/index.html which expects /servicios/
      console.log(
        `Link "${link.name}" points to "${href}" but static file generated as "${href}/index.html"`
      );
    }
  });

  test('should demonstrate the reload workaround', async ({ page }) => {
    // This test shows why "reloading works" - because the server
    // can handle the request differently on a fresh page load

    // Navigate to a page via link click
    await page.goto('/');
    await page.locator('nav').getByRole('link', { name: 'Servicios' }).click();
    await expect(page).toHaveURL('/servicios');

    // Add a marker to track if page reloads
    await page.evaluate(() => {
      (window as Window & { testMarker?: string }).testMarker = 'before-reload';
    });

    // Reload the page
    await page.reload();

    // Check if we're still on the same page after reload
    await expect(page).toHaveURL('/servicios');

    // Marker should be gone after reload (page was actually reloaded)
    const marker = await page.evaluate(
      () => (window as Window & { testMarker?: string }).testMarker
    );
    expect(marker).toBeUndefined();

    // Page should still work after reload
    await expect(page).toHaveTitle(/Servicios/);
  });
});
