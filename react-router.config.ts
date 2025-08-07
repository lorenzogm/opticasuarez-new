import type { Config } from '@react-router/dev/config';
import { getBlogPosts } from './app/ui/lib/blog';

export default {
  ssr: true,
  basename: '/',
  async prerender() {
    const blogPosts = getBlogPosts();
    const blogRoutes = blogPosts.map((post) => `/blog/${post.slug}/`);
    
    // Generate routes with trailing slashes for proper static file structure
    const routes = [
      '/',
      '/blog/', 
      '/book/',
      '/book/step2/',
      '/book/step3/',
      '/book/step4/',
      '/quienes-somos/',
      '/servicios/',
      '/vision-deportiva/',
      '/control-de-miopia/',
      '/vision-pediatrica/',
      '/terapia-visual/',
      '/contactologia/',
      '/examen-visual/',
      '/contacto/',
      ...blogRoutes,
    ];
    
    // Also generate routes without trailing slashes for navigation link compatibility
    // This ensures internal links (e.g., "/servicios") work on static hosting platforms
    const routesWithoutTrailingSlash = [
      '/blog',
      '/book',
      '/book/step2',
      '/book/step3', 
      '/book/step4',
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
    
    return [...routes, ...routesWithoutTrailingSlash];
  },
} satisfies Config;
