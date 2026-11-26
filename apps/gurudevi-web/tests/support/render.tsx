import {
  createMemoryHistory,
  createRootRoute,
  createRouter,
  RouterContextProvider,
} from '@tanstack/react-router';
import { type RenderOptions, type RenderResult, render as renderDom } from '@testing-library/react';
import type { ReactElement, ReactNode } from 'react';
import type { RouterContext } from '../../spa/routes/__root';

/**
 * A router with no routes of its own, at `path`: enough for links and navigation in a screen
 * test. `context` stands in for what the app gives every route (its sources and commands).
 */
export function createTestRouter(path = '/', context: Partial<RouterContext> = {}) {
  return createRouter({
    routeTree: createRootRoute(),
    history: createMemoryHistory({ initialEntries: [path] }),
    context,
  });
}

export type TestRouter = ReturnType<typeof createTestRouter>;

type Options = Omit<RenderOptions, 'wrapper'> &
  Readonly<{
    /** Where the screen is shown. Defaults to `/`. */
    path?: string;
    router?: TestRouter;
    wrapper?: (props: { children: ReactNode }) => ReactNode;
  }>;

/**
 * Renders a screen the way the app shows it: inside the router, so links resolve and
 * navigation can be read back from `router.history.location`.
 */
export function render(
  ui: ReactElement,
  { path, router = createTestRouter(path), wrapper: Inner, ...options }: Options = {},
): RenderResult & { router: TestRouter } {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <RouterContextProvider router={router}>
        {Inner ? <Inner>{children}</Inner> : children}
      </RouterContextProvider>
    );
  }
  return { router, ...renderDom(ui, { ...options, wrapper: Wrapper }) };
}
