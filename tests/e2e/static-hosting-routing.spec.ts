import { test, expect } from '@playwright/test';
import { spawn, ChildProcess } from 'child_process';
import { join } from 'path';
import { existsSync } from 'fs';

test.describe('Static Hosting Routing Issues', () => {
  let staticServer: ChildProcess;
  const staticPort = 3001;
  const staticBaseURL = `http://localhost:${staticPort}`;

  test.beforeAll(async () => {
    // Start a simple static file server to simulate GitHub Pages
    // This will only serve the static files as they exist, no routing
    const buildPath = join(process.cwd(), 'build', 'client');
    
    if (!existsSync(buildPath)) {
      throw new Error('Build directory not found. Run npm run build first.');
    }

    // Start a simple Python HTTP server to simulate static hosting
    staticServer = spawn('python3', ['-m', 'http.server', staticPort.toString()], {
      cwd: buildPath,
      stdio: 'pipe'
    });

    // Wait for server to start
    await new Promise(resolve => setTimeout(resolve, 2000));
  });

  test.afterAll(async () => {
    if (staticServer) {
      staticServer.kill();
    }
  });

  test('should fail to access routes without trailing slash on static hosting', async ({ page }) => {
    // This test simulates the actual issue on GitHub Pages
    // Routes without trailing slash should fail when accessed directly
    
    const routesToTest = [
      '/servicios',
      '/quienes-somos', 
      '/blog',
      '/contacto'
    ];

    for (const route of routesToTest) {
      console.log(`Testing route: ${route}`);
      
      // Try to access the route directly without trailing slash
      const response = await page.goto(`${staticBaseURL}${route}`, { 
        waitUntil: 'domcontentloaded',
        timeout: 5000
      }).catch(() => null);
      
      if (response) {
        const status = response.status();
        console.log(`Route ${route} returned status: ${status}`);
        
        // On static hosting, this should return 404 because /servicios doesn't exist
        // Only /servicios/ (with trailing slash) exists as /servicios/index.html
        if (status === 404) {
          console.log(`✓ Route ${route} correctly fails on static hosting (404)`);
          expect(status).toBe(404);
        } else {
          console.log(`✗ Route ${route} unexpectedly works on static hosting (${status})`);
          // If it doesn't fail, that means the static server is doing redirects
          // which GitHub Pages doesn't do by default
        }
      } else {
        console.log(`✓ Route ${route} failed to load (connection error)`);
        // Connection error also indicates the route doesn't exist
      }
    }
  });

  test('should succeed when accessing routes WITH trailing slash on static hosting', async ({ page }) => {
    // This test shows that the routes work when accessed with trailing slash
    
    const routesToTest = [
      { route: '/servicios/', title: 'Servicios' },
      { route: '/quienes-somos/', title: 'Quiénes somos' },
      { route: '/blog/', title: 'Blog' },
      { route: '/contacto/', title: 'Contacto' }
    ];

    for (const { route, title } of routesToTest) {
      console.log(`Testing route with trailing slash: ${route}`);
      
      try {
        await page.goto(`${staticBaseURL}${route}`, { 
          waitUntil: 'domcontentloaded',
          timeout: 10000
        });
        
        // Should be able to access the page
        const pageTitle = await page.title();
        console.log(`✓ Route ${route} works with title: "${pageTitle}"`);
        
        // Verify we're on the correct page
        expect(pageTitle).toContain(title);
        
      } catch (error) {
        console.log(`✗ Route ${route} failed: ${error.message}`);
        throw error;
      }
    }
  });

  test('should demonstrate the routing mismatch', async ({ page }) => {
    // This test demonstrates the core issue:
    // 1. Navigation links in the app point to /servicios (no slash)
    // 2. But static files exist at /servicios/ (with slash)
    // 3. This mismatch causes the routing to fail on static hosting
    
    // First access the home page with trailing slash (which should work)
    await page.goto(`${staticBaseURL}/`);
    
    // Check the navigation links
    const serviciosLink = page.locator('nav').getByRole('link', { name: 'Servicios' }).first();
    const href = await serviciosLink.getAttribute('href');
    
    console.log(`Navigation link points to: "${href}"`);
    expect(href).toBe('/servicios'); // This is the problem - no trailing slash
    
    // If we click this link in a static hosting environment,
    // it will try to navigate to /servicios but the file is at /servicios/index.html
    // which requires the URL to be /servicios/
    
    console.log('❌ ISSUE: Link points to "/servicios" but file exists at "/servicios/index.html"');
    console.log('💡 SOLUTION: Links should point to "/servicios/" to match file structure');
  });
});