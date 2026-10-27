import { closeReplayAdmission, openReplayAdmission } from '@repo/core/lib/sync/replayAdmission';
import SyncManager from '@repo/core/lib/sync/sync/SyncManager';
import type { QueuedMutation } from '@repo/core/lib/sync/types';
import { useMutationQueue } from '@repo/core/lib/sync/useMutationQueue';
import { useTemporalStore } from '@repo/core/store/useTemporalStore';
import { act, render } from '@testing-library/react';
import { createElement } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const fixture = vi.hoisted(() => ({
  account: 'account-scheduler',
  authCheck: vi.fn(async () => true),
  execute: vi.fn(async () => ({ status: 'completed' })),
  updateEntry: vi.fn(),
  toast: vi.fn(),
  conflicts: { addConflict: vi.fn(), activeConflicts: [] },
}));
vi.mock('@repo/core/lib/storageWrapper', () => ({
  SafeZustandStorage: {
    getItem: async () => null,
    setItem: async () => undefined,
    removeItem: async () => undefined,
  },
}));
vi.mock('@repo/core/lib/sync/registry', () => ({
  MUTATION_REGISTRY: { schedulerCommand: fixture.execute },
}));
vi.mock('@repo/core/lib/sync/replayIdentity', () => ({
  isReplayPrincipalCurrent: fixture.authCheck,
}));
vi.mock('@repo/core/offline/useOfflineStatus', () => ({
  useOfflineStatus: () => ({ isOnline: true }),
}));
vi.mock('@repo/core/store/useAuthStore', () => {
  const state = { user: { id: fixture.account }, showToast: fixture.toast };
  return {
    useAuthStore: Object.assign(<T,>(selector: (value: typeof state) => T) => selector(state), {
      getState: () => state,
    }),
  };
});
vi.mock('@repo/core/lib/sync/MutationAuditLog', () => ({
  useMutationAuditLog: () => ({ updateEntry: fixture.updateEntry }),
}));
vi.mock('@repo/core/store/useConflictStore', () => ({ useConflictStore: () => fixture.conflicts }));
vi.mock('@repo/core/lib/sync/versionGating', () => ({
  useVersionGatingStore: { getState: () => ({ isBlocked: false }) },
}));
vi.mock('@repo/core/monitoring/breadcrumbs', () => ({ leaveBreadcrumb: vi.fn() }));

function command(overrides: Partial<QueuedMutation> = {}): QueuedMutation {
  return {
    id: 'scheduled-command',
    operationId: 'scheduled-operation',
    idempotencyKey: 'key',
    type: 'CREATE',
    scope: 'test',
    name: 'schedulerCommand',
    userId: fixture.account,
    variables: {},
    timestamp: 0,
    retryCount: 0,
    commandState: 'queued',
    ...overrides,
  };
}
beforeEach(async () => {
  await useMutationQueue.persist.rehydrate();
  useMutationQueue.getState().clearQueue();
  useMutationQueue.getState().setSyncing(false);
  openReplayAdmission(fixture.account);
  fixture.execute.mockClear();
  fixture.authCheck.mockReset().mockResolvedValue(true);
  useTemporalStore.setState({ readPolicy: 'live' });
  vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] });
});
afterEach(() => {
  vi.useRealTimers();
});

describe('mounted outbox scheduler with transport/auth/storage substitutes', () => {
  it('schedules one deadline instead of spinning on a backed-off command', async () => {
    const deadline = Date.now() + 5000;
    useMutationQueue.setState({
      queue: [command({ commandState: 'retry_scheduled', backoffUntil: deadline })],
    });
    const view = render(createElement(SyncManager));
    expect(fixture.execute).not.toHaveBeenCalled();
    expect(useMutationQueue.getState().isSyncing).toBe(false);
    await act(async () => {
      await vi.advanceTimersByTimeAsync(4999);
    });
    expect(fixture.execute).not.toHaveBeenCalled();
    await act(async () => {
      await vi.advanceTimersByTimeAsync(1);
    });
    expect(fixture.execute).toHaveBeenCalledTimes(1);
    expect(useMutationQueue.getState().queue).toHaveLength(0);
    view.unmount();
    expect(vi.getTimerCount()).toBe(0);
  });
  it('pauses a credential mismatch rather than repeatedly draining it', async () => {
    fixture.authCheck.mockResolvedValue(false);
    useMutationQueue.setState({ queue: [command()] });
    const view = render(createElement(SyncManager));
    await act(async () => {
      await Promise.resolve();
    });
    expect(useMutationQueue.getState().queue[0]?.commandState).toBe('auth_paused');
    await act(async () => {
      await vi.advanceTimersByTimeAsync(60_000);
    });
    expect(fixture.authCheck).toHaveBeenCalledTimes(1);
    expect(fixture.execute).not.toHaveBeenCalled();
    view.unmount();
  });
  it('wakes when the matching principal gate explicitly reopens', async () => {
    await closeReplayAdmission(fixture.account);
    useMutationQueue.setState({ queue: [command()] });
    const view = render(createElement(SyncManager));
    expect(fixture.execute).not.toHaveBeenCalled();
    await act(async () => {
      openReplayAdmission(fixture.account);
    });
    expect(fixture.execute).toHaveBeenCalledTimes(1);
    expect(useMutationQueue.getState().queue).toHaveLength(0);
    view.unmount();
  });
});
