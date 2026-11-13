import { DEFAULT_WORLD } from '@repo/ui/theme';
import { sharedTokenCss, worldsCss } from '@repo/ui/theme/web';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { createRoot } from 'react-dom/client';
import { getQueryClient } from '../lib/query/getQueryClient';
import '../app/styles.css';
import { routeTree } from './generated/routeTree.gen';
import { accountHome, commands, Surface, sources } from '#surface';
import { QueryProvider } from '../lib/query/QueryProvider';
import { applySavedPreferences } from '../lib/runtime/savedPreferences';
import { watchForNewBuild } from '../lib/runtime/staleBuild';
import { PageNotFound, RouteError } from './surface/boundaries';

// `#surface` is the surface this build serves (spa/surface/explore.tsx or account.tsx, chosen in
// vite.config.ts). The same routes and screens run on every surface; only who is here and where
// data comes from change.
const router = createRouter({
  routeTree,
  context: { queryClient: getQueryClient(), sources, commands, accountHome },
  defaultPreload: 'intent',
  // Loaders read through the query cache, so the router never holds a second copy of the data.
  defaultPreloadStaleTime: 0,
  defaultErrorComponent: RouteError,
  defaultNotFoundComponent: PageNotFound,
  // Back and forward return to where the person was on each page; a new page starts at its top,
  // including inside the shell's own scroll area, which outlives the page.
  scrollRestoration: true,
  scrollToTopSelectors: ['#sanctuary-main'],
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

document.documentElement.dataset.world = DEFAULT_WORLD;
applySavedPreferences();
watchForNewBuild();

const container = document.getElementById('app');
if (!container) throw new Error('#app is missing from index.html');
createRoot(container).render(
  <QueryProvider>
    <Surface>
      <RouterProvider router={router} />
    </Surface>
  </QueryProvider>,
);
