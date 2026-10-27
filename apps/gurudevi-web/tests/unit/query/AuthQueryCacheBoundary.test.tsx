import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import * as AuthModule from '../../../app/(sanctuary)/auth/AuthProvider';
import { AuthQueryCacheBoundary } from '../../../lib/query/AuthQueryCacheBoundary';

describe('AuthQueryCacheBoundary', () => {
  it('removes outgoing and legacy queries without clearing mutations when the subject changes', async () => {
    const queryClient = new QueryClient();
    const clearSpy = vi.spyOn(queryClient, 'clear');
    const mutation = queryClient.getMutationCache().build(queryClient, {
      mutationKey: ['command', 'user-alpha'],
      mutationFn: async () => undefined,
    });
    const alphaScopeKey = ['scope', 'user-alpha', null, null, null, 'profile'] as const;
    queryClient.setQueryData(alphaScopeKey, { name: 'Alpha' });
    queryClient.setQueryData(['legacy', 'profile'], { name: 'Legacy Alpha' });

    const authSpy = vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
      state: {
        status: 'authenticated',
        session: {
          user: { id: 'user-alpha', email: 'alpha@example.com' },
          access_token: 'token-a',
          expires_at: 9999999999,
          refresh_token: 'refresh-a',
          token_type: 'bearer',
        },
        error: null,
      },
      refresh: vi.fn(),
      signOut: vi.fn(),
    });

    const { rerender } = render(
      <QueryClientProvider client={queryClient}>
        <AuthQueryCacheBoundary />
      </QueryClientProvider>,
    );

    // Initial render does not dispose existing state.
    expect(clearSpy).not.toHaveBeenCalled();

    // Rerender with a different user ID
    authSpy.mockReturnValue({
      state: {
        status: 'authenticated',
        session: {
          user: { id: 'user-beta', email: 'beta@example.com' },
          access_token: 'token-b',
          expires_at: 9999999999,
          refresh_token: 'refresh-b',
          token_type: 'bearer',
        },
        error: null,
      },
      refresh: vi.fn(),
      signOut: vi.fn(),
    });

    rerender(
      <QueryClientProvider client={queryClient}>
        <AuthQueryCacheBoundary />
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(queryClient.getQueryData(alphaScopeKey)).toBeUndefined();
      expect(queryClient.getQueryData(['legacy', 'profile'])).toBeUndefined();
    });
    expect(queryClient.getMutationCache().getAll()).toContain(mutation);
    expect(clearSpy).not.toHaveBeenCalled();

    // Rerender with the same user ID does not clear again
    rerender(
      <QueryClientProvider client={queryClient}>
        <AuthQueryCacheBoundary />
      </QueryClientProvider>,
    );

    expect(clearSpy).not.toHaveBeenCalled();
  });
});
