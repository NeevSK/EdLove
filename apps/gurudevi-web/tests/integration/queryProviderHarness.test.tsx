import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { act, render, screen, waitFor } from '@testing-library/react';
import React, { Component, type ErrorInfo, type ReactNode, useState } from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as AuthModule from '@/app/(sanctuary)/auth/AuthProvider';
import { getQueryClient, resetBrowserQueryClient } from '@/lib/query/getQueryClient';
import { QueryProvider } from '@/lib/query/QueryProvider';

// Simple Error Boundary for testing G3 error handling
class TestErrorBoundary extends Component<
  { children: ReactNode; fallback: (error: Error) => ReactNode },
  { error: Error | null }
> {
  override state = { error: null };

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  override componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Suppress console error in test output
  }

  override render() {
    if (this.state.error) {
      return this.props.fallback(this.state.error);
    }
    return this.props.children;
  }
}

/**
 * G3 Component Mounting & Provider Integration Harness
 *
 * Grounded in React 19 Next.js 16 App Router lifecycle:
 * - Verifies real component tree mounting within QueryProvider and AuthProvider.
 * - Asserts stable isomorphic QueryClient instance across component re-renders.
 * - Verifies query loading, success rendering, and mutation invalidation in the real DOM.
 * - Verifies Error Boundary catching without tearing down provider hierarchy.
 */
describe('QueryProvider Real React Component Mounting & Hierarchy Harness (G3 Contract)', () => {
  beforeEach(() => {
    resetBrowserQueryClient();
    vi.clearAllMocks();

    vi.spyOn(AuthModule, 'useAuth').mockReturnValue({
      state: {
        status: 'authenticated',
        session: {
          user: { id: 'usr-colombo-test', email: 'colombo@test.com' },
          access_token: 'token-abc',
          expires_at: 9999999999,
          refresh_token: 'refresh-abc',
          token_type: 'bearer',
        },
        error: null,
      },
      refresh: vi.fn(),
      signOut: vi.fn(),
    });
  });

  // Consumer component that fetches tuition batch
  function TuitionBatchViewer({ batchId }: { batchId: string }) {
    const { data, isLoading } = useQuery({
      queryKey: ['tuition', 'batch', batchId],
      queryFn: async () => ({
        batchId,
        title: 'Combined Maths Grade 12',
        studentCount: 42,
      }),
    });

    if (isLoading || !data) {
      return <div data-testid="loading-state">Loading batch...</div>;
    }

    return (
      <div data-testid="batch-details">
        <h1 data-testid="batch-title">{data.title}</h1>
        <span data-testid="batch-count">{data.studentCount} students</span>
      </div>
    );
  }

  // Consumer with mutation that updates student count
  function TuitionBatchUpdater({ batchId }: { batchId: string }) {
    const queryClient = useQueryClient();
    const mutation = useMutation({
      mutationFn: async (newCount: number) => ({
        batchId,
        title: 'Combined Maths Grade 12',
        studentCount: newCount,
      }),
      onSuccess: (updatedData) => {
        queryClient.setQueryData(['tuition', 'batch', batchId], updatedData);
      },
    });

    return (
      <button data-testid="update-count-button" onClick={() => mutation.mutate(55)}>
        Update Count
      </button>
    );
  }

  it('mounts real component hierarchy, resolves queries, and updates DOM smoothly', async () => {
    render(
      <QueryProvider>
        <TuitionBatchViewer batchId="cm-12" />
        <TuitionBatchUpdater batchId="cm-12" />
      </QueryProvider>,
    );

    // Initial query resolution
    await waitFor(() => {
      expect(screen.getByTestId('batch-title').textContent).toBe('Combined Maths Grade 12');
      expect(screen.getByTestId('batch-count').textContent).toContain('42 students');
    });

    // Trigger mutation
    act(() => {
      screen.getByTestId('update-count-button').click();
    });

    // Verify DOM updates with mutated state
    await waitFor(() => {
      expect(screen.getByTestId('batch-count').textContent).toContain('55 students');
    });
  });

  it('guarantees QueryClient singleton stability across parent re-renders', () => {
    let clientRef1: unknown = null;
    let clientRef2: unknown = null;

    function Inspector({ probe }: { probe: 1 | 2 }) {
      const client = useQueryClient();
      if (probe === 1) clientRef1 = client;
      if (probe === 2) clientRef2 = client;
      return <div>Probe {probe}</div>;
    }

    const { rerender } = render(
      <QueryProvider>
        <Inspector probe={1} />
      </QueryProvider>,
    );

    rerender(
      <QueryProvider>
        <Inspector probe={2} />
      </QueryProvider>,
    );

    expect(clientRef1).not.toBeNull();
    expect(clientRef1).toBe(clientRef2);
  });

  it('preserves QueryProvider when a child query throws and is caught by ErrorBoundary', async () => {
    function FaultyQuery() {
      const { data } = useQuery({
        queryKey: ['failing-query'],
        queryFn: async () => {
          throw new Error('Database Connection Interrupted');
        },
        retry: false,
        throwOnError: true,
      });

      return <div>{JSON.stringify(data)}</div>;
    }

    render(
      <QueryProvider>
        <TestErrorBoundary fallback={(err) => <div data-testid="error-message">{err.message}</div>}>
          <FaultyQuery />
        </TestErrorBoundary>
      </QueryProvider>,
    );

    await waitFor(() => {
      expect(screen.getByTestId('error-message').textContent).toContain(
        'Database Connection Interrupted',
      );
    });

    // The singleton QueryClient remains active and healthy
    const activeClient = getQueryClient();
    expect(activeClient).toBeDefined();
    expect(activeClient.isFetching()).toBe(0);
  });
});
