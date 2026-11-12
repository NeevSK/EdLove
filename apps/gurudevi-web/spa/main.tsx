import { createRouter, RouterProvider } from '@tanstack/react-router';
import { createRoot } from 'react-dom/client';
import { DEFAULT_WORLD } from '@repo/ui/theme';
import { sharedTokenCss, worldsCss } from '@repo/ui/theme/web';
import '../app/styles.css';
import { routeTree } from './generated/routeTree.gen';

const router = createRouter({ routeTree, defaultPreload: 'intent' });

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
createRoot(container).render(<RouterProvider router={router} />);
