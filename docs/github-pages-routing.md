# GitHub Pages SPA Routing Fix

This repository has been configured to work correctly with GitHub Pages static hosting for single-page application (SPA) routing.

## Problem

When deploying a React Router application to GitHub Pages (or any static hosting), direct navigation to routes like `/servicios` or `/quienes-somos` would fail with a 404 error. This happens because:

1. User visits `/servicios` directly
2. GitHub Pages looks for a file at `/servicios/index.html`
3. If not found, GitHub Pages returns a 404 error

However, refreshing the page would work because the route exists as a prerendered HTML file.

## Solution

The fix involves two key components:

### 1. 404.html Fallback (`/public/404.html`)

- GitHub Pages automatically serves `404.html` for missing routes
- Our `404.html` contains JavaScript that redirects to the main app with a special query format
- Example: `/servicios` becomes `/?/servicios`

### 2. Client-side URL Restoration (`/app/entry.client.tsx`)

- Custom entry point that runs before React Router initializes
- Parses the redirected URL format and restores the original path
- Uses `window.history.replaceState()` to clean up the URL

## How it Works

1. User visits `/servicios` directly
2. GitHub Pages serves `404.html` (because `/servicios` doesn't exist as a file)
3. JavaScript in `404.html` redirects to `/?/servicios`
4. Main app loads at `/?/servicios`
5. `entry.client.tsx` detects the query parameter and restores URL to `/servicios`
6. React Router handles the route normally

## Files Modified

- `/public/404.html` - GitHub Pages fallback page
- `/app/entry.client.tsx` - Custom client entry with URL restoration logic

## Testing

To test locally, build the application and serve the static files:

```bash
npm run build
cd build/client
python3 -m http.server 8080
```

Note: Local servers don't automatically serve 404.html, so you need to test the actual deployment on GitHub Pages to see the full routing behavior.