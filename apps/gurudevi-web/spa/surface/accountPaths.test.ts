import { QueryClient } from '@tanstack/react-query';
import { createMemoryHistory, createRouter } from '@tanstack/react-router';
import { describe, expect, it } from 'vitest';
import { routeTree } from '../generated/routeTree.gen';
import { accountHome, commands, sources } from './explore';
import { ACCOUNT_PATHS } from './sources';

describe('account addresses (G1 / Vitest; the generated route tree)', () => {
  it('names exactly the routes under _account, so Explore forwards every one', () => {
    const router = createRouter({
      routeTree,
      history: createMemoryHistory(),
      context: { queryClient: new QueryClient(), sources, commands, accountHome },
    });
    const accountRoutes = Object.values(router.routesById)
      .filter((route) => route.id.startsWith('/_account/'))
      .map((route) => route.fullPath)
      .sort();
    expect([...ACCOUNT_PATHS].sort()).toEqual(accountRoutes);
  });
});
