import { act, render, renderHook } from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthProvider, useAuth } from '@/app/(sanctuary)/auth/AuthProvider';
import * as SignOutModule from '@/lib/sanctuary/signOut';

vi.mock('@/app/(sanctuary)/auth/browserAuth', () => ({
  browserAuthRuntime: () => ({
    bootstrapIdentity: vi.fn().mockResolvedValue({
      status: 'authenticated',
      session: {
        access_token: 'test-token',
        user: { id: 'usr-123', email: 'scholar@gurudevi.app' },
      },
    }),
    client: {
      auth: {
        signOut: vi.fn().mockResolvedValue({ error: null }),
      },
    },
  }),
}));

describe('Unit/Integration: AuthProvider Atomic SignOut Seam', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('invokes sanctuarySignOut when signOut() is called from useAuth', async () => {
    const sanctuarySignOutSpy = vi
      .spyOn(SignOutModule, 'sanctuarySignOut')
      .mockResolvedValue(undefined);

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => <AuthProvider>{children}</AuthProvider>,
    });

    // Wait for bootstrap
    await act(async () => {
      await Promise.resolve();
    });

    expect(result.current.state.status).toBe('authenticated');

    // Trigger signOut
    await act(async () => {
      await result.current.signOut();
    });

    expect(sanctuarySignOutSpy).toHaveBeenCalledTimes(1);
    expect(result.current.state.status).toBe('signed-out');
    expect(result.current.state.session).toBeNull();
  });
});
