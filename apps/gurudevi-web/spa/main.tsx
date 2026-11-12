import { DEFAULT_WORLD } from '@repo/ui/theme';
import { sharedTokenCss, worldsCss } from '@repo/ui/theme/web';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { createRoot } from 'react-dom/client';
import { getQueryClient } from '../lib/query/getQueryClient';
import '../app/styles.css';
import { routeTree } from './generated/routeTree.gen';
import { ExploreSession, exploreSources } from './surface/explore';

// The surface this build serves. The same routes and screens run on every surface; only who is here
// and where data comes from change.
const router = createRouter({
  routeTree,
  context: { queryClient: getQueryClient(), sources: exploreSources },
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
  <ExploreSession>
    <RouterProvider router={router} />
  </ExploreSession>,
);
