#!/usr/bin/env node

import { writeFileSync, readdirSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Get the root directory (one level up from scripts)
const rootDir = join(__dirname, '..');

async function getRoutesFromBuildOutput() {
  try {
    // Check if build client directory exists (should be the case since this runs in postbuild)
    const buildClientDir = join(rootDir, 'build', 'client');
    
    if (existsSync(buildClientDir)) {
      const routes = [];
      
      // Add root route
      if (existsSync(join(buildClientDir, 'index.html'))) {
        routes.push('/');
      }
      
      // Recursively find all prerendered routes by looking for index.html files
      function findRoutes(dir, basePath = '') {
        const items = readdirSync(dir, { withFileTypes: true });
        
        for (const item of items) {
          if (item.isDirectory() && item.name !== 'assets' && item.name !== '.vite') {
            const routePath = `${basePath}/${item.name}`;
            const subDir = join(dir, item.name);
            
            // Check if this directory has an index.html (indicating a route)
            if (existsSync(join(subDir, 'index.html'))) {
              routes.push(routePath);
            }
            
            // Recursively check subdirectories
            findRoutes(subDir, routePath);
          }
        }
      }
      
      findRoutes(buildClientDir);
      
      return routes.sort();
    }
    
    return [];
  } catch (error) {
    console.warn('Could not read routes from build output:', error.message);
    return [];
  }
}

async function getRoutesFromConfig() {
  try {
    // Import the React Router config to get prerender routes
    const configPath = join(rootDir, 'react-router.config.ts');
    const { default: config } = await import(configPath);
    
    // Get routes from prerender function
    if (config.prerender) {
      const routes = await config.prerender();
      return routes;
    }
    
    return [];
  } catch (error) {
    console.warn('Could not read routes from React Router config:', error.message);
    return [];
  }
}

async function getFallbackRoutes() {
  try {
    // Import the blog helper to get blog posts
    const { getBlogPosts } = await import('../app/ui/lib/blog.ts');
    const blogPosts = getBlogPosts();
    const blogRoutes = blogPosts.map((post) => `/blog/${post.slug}`);

    return [
      '/',
      '/blog',
      '/quienes-somos', 
      '/servicios',
      '/vision-deportiva',
      '/control-de-miopia',
      '/vision-pediatrica',
      '/terapia-visual',
      '/contactologia',
      '/examen-visual',
      '/contacto',
      ...blogRoutes,
    ];
  } catch (error) {
    console.warn('Could not read blog posts, using minimal routes:', error.message);
    return [
      '/',
      '/blog',
      '/quienes-somos', 
      '/servicios',
      '/vision-deportiva',
      '/control-de-miopia',
      '/vision-pediatrica',
      '/terapia-visual',
      '/contactologia',
      '/examen-visual',
      '/contacto',
    ];
  }
}

async function generateSitemap() {
  try {
    const baseUrl = 'https://opticasuarezjaen.es';
    const currentDate = new Date().toISOString();
    
    // Try to get routes from build output first, then config, then fallback
    let routes = await getRoutesFromBuildOutput();
    
    if (routes.length === 0) {
      routes = await getRoutesFromConfig();
    }
    
    if (routes.length === 0) {
      routes = await getFallbackRoutes();
    }
    
    console.log(`Generating sitemap with ${routes.length} routes...`);
    
    // Create XML sitemap
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;

    // Add each route to the sitemap
    routes.forEach(route => {
      // Determine priority based on route
      let priority = '0.8'; // default priority
      let changefreq = 'weekly'; // default change frequency
      
      if (route === '/') {
        priority = '1.0';
        changefreq = 'weekly';
      } else if (route.startsWith('/blog/')) {
        priority = '0.7';
        changefreq = 'monthly';
      } else if (route === '/blog') {
        priority = '0.9';
        changefreq = 'weekly';
      } else {
        priority = '0.8';
        changefreq = 'monthly';
      }

      sitemap += `
  <url>
    <loc>${baseUrl}${route}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    });

    sitemap += `
</urlset>`;

    // Write sitemap to build/client directory
    const buildClientDir = join(rootDir, 'build', 'client');
    const sitemapPath = join(buildClientDir, 'sitemap.xml');
    
    writeFileSync(sitemapPath, sitemap, 'utf8');
    
    console.log(`✓ Sitemap generated successfully at ${sitemapPath}`);
    console.log(`✓ Included ${routes.length} URLs in sitemap`);
    
    // Also write to public directory for development
    const publicSitemapPath = join(rootDir, 'public', 'sitemap.xml');
    writeFileSync(publicSitemapPath, sitemap, 'utf8');
    console.log(`✓ Sitemap also saved to ${publicSitemapPath} for development`);
    
  } catch (error) {
    console.error('Error generating sitemap:', error);
    process.exit(1);
  }
}

generateSitemap();