import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import * as AuthModule from '../../../app/(sanctuary)/auth/AuthProvider';
import { AuthQueryCacheBoundary } from '../../../lib/query/AuthQueryCacheBoundary';

describe('AuthQueryCacheBoundary', () => {
  it('clears query cache when subject ID transitions between users', () => {
    const queryClient = new QueryClient();
    const clearSpy = vi.spyOn(queryClient, 'clear');

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

    // Initial render does not clear existing state
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

    expect(clearSpy).toHaveBeenCalledTimes(1);

    // Rerender with the same user ID does not clear again
    rerender(
      <QueryClientProvider client={queryClient}>
        <AuthQueryCacheBoundary />
      </QueryClientProvider>,
    );

    expect(clearSpy).toHaveBeenCalledTimes(1);
  });
});
