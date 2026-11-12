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

// The same world styles and brand variables the Next root layout writes into <head>.
const style = document.createElement('style');
style.id = 'gd-worlds';
style.textContent = `:root{${sharedTokenCss}}\n${worldsCss()}`;
document.head.append(style);
const html = document.documentElement;
html.dataset.world = localStorage.getItem('gurudevi_world') ?? DEFAULT_WORLD;

const container = document.getElementById('app');
if (!container) throw new Error('#app is missing from index.html');
createRoot(container).render(<RouterProvider router={router} />);
