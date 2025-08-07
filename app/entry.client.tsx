import { startTransition, StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { HydratedRouter } from 'react-router/dom';

// Single Page Apps for GitHub Pages
// Handle redirected URLs from 404.html
(function() {
  if (window.location.search) {
    var query = window.location.search.substring(1);
    if (query.startsWith('/')) {
      var path = query.replace(/&/g, '?').replace(/~and~/g, '&');
      window.history.replaceState(null, '', path + window.location.hash);
    }
  }
})();

startTransition(() => {
  hydrateRoot(
    document,
    <StrictMode>
      <HydratedRouter />
    </StrictMode>
  );
});