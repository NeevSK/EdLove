import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, render, waitFor } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import * as AuthModule from '@/app/(sanctuary)/auth/AuthProvider';
import type { BrowserSession } from '@/app/(sanctuary)/auth/browserAuth';
import { AuthQueryCacheBoundary } from '@/lib/query/AuthQueryCacheBoundary';

/**
 * G2 Scenario Contract: Account Transition & Multi-Tenant Query Cache Isolation
 *
 * Grounded in Gurudevi Mobile's account-shell-transition-scenario and reality-signals invariants:
 * - Never allow User A's sensitive financial or academic query state to leak into User B's cache.
 * - In-flight queries belonging to the previous session must be cancelled / purged upon transition.
 * - Query-cache disposal never destroys MutationCache command ownership.
 */
describe('Scenario: Account Transition & Multi-Tenant Query Cache Isolation (G2 Contract)', () => {
  let mockAuthSession: BrowserSession | null = null;
  let mockAuthStatus: 'authenticated' | 'loading' | 'signed-out' | 'unavailable' = 'signed-out';

  beforeEach(() => {
    vi.clearAllMocks();
    mockAuthSession = {
      user: { id: 'usr-colombo-founder-001', email: 'founder@colombo.edu.lk' },
      access_token: 'token-usr-a',
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      refresh_token: 'refresh-usr-a',
      token_type: 'bearer',
    };
    mockAuthStatus = 'authenticated';

    vi.spyOn(AuthModule, 'useAuth').mockImplementation(() => ({
      state: {
        status: mockAuthStatus,
        session: mockAuthSession,
        error: null,
      },
      refresh: vi.fn(),
      signOut: vi.fn(),
    }));
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('removes legacy and outgoing scoped queries while preserving MutationCache commands', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: {
          staleTime: 5 * 60 * 1000,
          gcTime: 10 * 60 * 1000,
        },
      },
    });

    const clearSpy = vi.spyOn(queryClient, 'clear');

    const mutation = queryClient.getMutationCache().build(queryClient, {
      mutationKey: ['command', 'usr-colombo-founder-001'],
      mutationFn: async () => undefined,
    });

    // 1. User A (Colombo Founder) hydrates sensitive financial & academic records.
    queryClient.setQueryData(['tuition', 'batches', 'colombo'], {
      batchId: 'batch-colombo-2026',
      collectedLkr: 450000,
      studentCount: 35,
    });
    queryClient.setQueryData(
      ['academic', 'submissions', 'colombo'],
      [
        { studentId: 'stu-101', assignment: 'Thermodynamics Problem Set 4', grade: 'A' },
        { studentId: 'stu-102', assignment: 'Classical Sinhala Verse Translation', grade: 'B+' },
      ],
    );
    queryClient.setQueryData(['user', 'profile'], {
      id: 'usr-colombo-founder-001',
      role: 'founder',
      institution: 'Apex Institute Colombo',
    });

    // Verify User A cache is actively populated
    expect(queryClient.getQueryData(['tuition', 'batches', 'colombo'])).toBeDefined();
    expect(queryClient.getQueryData(['academic', 'submissions', 'colombo'])).toBeDefined();
    expect(queryClient.getQueryData(['user', 'profile'])).toMatchObject({
      id: 'usr-colombo-founder-001',
    });

    // 2. Mount the boundary simulating the active sanctuary application
    const Harness = () => (
      <QueryClientProvider client={queryClient}>
        <AuthQueryCacheBoundary />
      </QueryClientProvider>
    );

    const { rerender } = render(<Harness />);

    // Initial mount does NOT clear User A's hydrated queries
    expect(clearSpy).not.toHaveBeenCalled();

    // 3. User switches accounts to User B (Kandy Teacher)
    const userBSession: BrowserSession = {
      user: { id: 'usr-kandy-teacher-002', email: 'teacher@kandy.edu.lk' },
      access_token: 'token-usr-b',
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      refresh_token: 'refresh-usr-b',
      token_type: 'bearer',
    };

    mockAuthSession = userBSession;
    act(() => rerender(<Harness />));

    await waitFor(() => {
      expect(queryClient.getQueryData(['tuition', 'batches', 'colombo'])).toBeUndefined();
    });

    // Verify User A's sensitive records are completely wiped from QueryCache.
    expect(queryClient.getQueryData(['academic', 'submissions', 'colombo'])).toBeUndefined();
    expect(queryClient.getQueryData(['user', 'profile'])).toBeUndefined();
    expect(queryClient.getMutationCache().getAll()).toContain(mutation);
    expect(clearSpy).not.toHaveBeenCalled();

    // 4. User B populates their own scoped data
    queryClient.setQueryData(['tuition', 'batches', 'kandy'], {
      batchId: 'batch-kandy-2026',
      collectedLkr: 180000,
      studentCount: 15,
    });
    queryClient.setQueryData(['user', 'profile'], {
      id: 'usr-kandy-teacher-002',
      role: 'teacher',
      institution: 'Kandy High School',
    });

    expect(queryClient.getQueryData(['tuition', 'batches', 'kandy'])).toBeDefined();
    expect(queryClient.getQueryData(['tuition', 'batches', 'colombo'])).toBeUndefined();
    expect(queryClient.getQueryData(['user', 'profile'])).toMatchObject({
      id: 'usr-kandy-teacher-002',
    });

    // 5. User signs out to guest (session becomes null)
    mockAuthSession = null;
    act(() => rerender(<Harness />));

    await waitFor(() => {
      expect(queryClient.getQueryData(['tuition', 'batches', 'kandy'])).toBeUndefined();
      expect(queryClient.getQueryData(['user', 'profile'])).toBeUndefined();
    });
    expect(queryClient.getMutationCache().getAll()).toContain(mutation);
  });

  it('tolerates rapid successive account-switching cycles without broad cache clearing', async () => {
    const queryClient = new QueryClient();
    const clearSpy = vi.spyOn(queryClient, 'clear');

    const accounts = ['usr-alpha', 'usr-beta', 'usr-gamma', null, 'usr-delta'];

    const Harness = () => (
      <QueryClientProvider client={queryClient}>
        <AuthQueryCacheBoundary />
      </QueryClientProvider>
    );
    const { rerender } = render(<Harness />);

    for (const accountId of accounts) {
      mockAuthSession = accountId
        ? {
            user: { id: accountId, email: `${accountId}@example.com` },
            access_token: `token-${accountId}`,
            expires_at: 9999999999,
            refresh_token: `refresh-${accountId}`,
            token_type: 'bearer',
          }
        : null;
      if (accountId) queryClient.setQueryData(['secret', accountId], `data-for-${accountId}`);
      act(() => rerender(<Harness />));
    }

    await waitFor(() => expect(queryClient.getQueryCache().getAll()).toHaveLength(0));
    expect(clearSpy).not.toHaveBeenCalled();
  });
});
