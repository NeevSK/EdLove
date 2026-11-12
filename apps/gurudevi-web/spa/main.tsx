import { DEFAULT_WORLD } from '@repo/ui/theme';
import { sharedTokenCss, worldsCss } from '@repo/ui/theme/web';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { createRoot } from 'react-dom/client';
import { getQueryClient } from '../lib/query/getQueryClient';
import '../app/styles.css';
import { routeTree } from './generated/routeTree.gen';
import { accountHome, Surface, sources } from '#surface';
import { QueryProvider } from '../lib/query/QueryProvider';

// `#surface` is the surface this build serves (spa/surface/explore.tsx or account.tsx, chosen in
// vite.config.ts). The same routes and screens run on every surface; only who is here and where
// data comes from change.
const router = createRouter({
  routeTree,
  context: { queryClient: getQueryClient(), sources, accountHome },
  defaultPreload: 'intent',
  // Loaders read through the query cache, so the router never holds a second copy of the data.
  defaultPreloadStaleTime: 0,
});

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

// Brand variables and every world's rules, written once when the app starts.
const style = document.createElement('style');
style.id = 'gd-worlds';
style.textContent = `:root{${sharedTokenCss}}\n${worldsCss()}`;
document.head.append(style);

function savedWorld(): string | null {
  try {
    return localStorage.getItem('gurudevi_world');
  } catch {
    // Storage can be blocked (private mode, embedded browsers); the default world still renders.
    return null;
  }
}
document.documentElement.dataset.world = savedWorld() ?? DEFAULT_WORLD;

const container = document.getElementById('app');
if (!container) throw new Error('#app is missing from index.html');
createRoot(container).render(
  <QueryProvider>
    <Surface>
      <RouterProvider router={router} />
    </Surface>
  </QueryProvider>,
);
