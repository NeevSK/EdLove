import { createAuthenticatedV1Client } from '@repo/core/api/v1/client';
import { sovereignBus } from '@repo/core/lib/sync/eventBus.adapter';
import {
  PERSONAL_SCOPE_PERSPECTIVE,
  type ScopeSessionSnapshot,
  useScopeSessionStore,
} from '@repo/core/store/scopeSession';
import { useCedarDecisionStore } from '@repo/core/store/useCedarDecisionStore';
import type { Bond } from '@repo/core/logic/schemas/identity.schema';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { startPermissionSnapshotRefresh } from '../snapshotRefresh.adapter';

const writes = vi.hoisted(() => ({ run: vi.fn(async (_statement: unknown) => undefined) }));
vi.mock('@repo/core/adapters/powersync/database', () => ({
  getDrizzleDB: () => ({
    transaction: async (work: (tx: { run: typeof writes.run }) => Promise<void>) => work(writes),
  }),
}));

const bond: Bond = {
  id: '123e4567-e89b-4123-8123-426614174002',
  user_id: 'account-1',
  entity_id: 'personal-1',
  entity_type: 'PERSONAL',
  capacity: 'teacher',
  status: 'active',
};
const scope = (activeBond: Bond | null = bond): ScopeSessionSnapshot =>
  ({
    principalId: 'account-1',
    activePerspective: PERSONAL_SCOPE_PERSPECTIVE,
    activeBond,
  }) as ScopeSessionSnapshot;

function client(result: () => Promise<ReturnType<typeof issued>>) {
  const refreshSnapshot = vi.fn(async (_input: { bondId: string }) => result());
  return { refreshSnapshot, client: { authority: { refreshSnapshot } } };
}
const issued = (hoursLeft: number) => ({
  generatedAt: new Date().toISOString(),
  expiresAt: new Date(Date.now() + hoursLeft * 3_600_000).toISOString(),
  userId: 'account-1',
  activeBondId: bond.id,
  activeEntityId: 'personal-1',
  activeEntityType: 'PERSONAL',
  schoolId: null,
  policyVersion: 'sha256:abc',
  permissions: { Self: { read: true } },
  temporalHints: {},
  signature: 'ed25519:fixture',
});
const commit = (snapshot: ScopeSessionSnapshot) => {
  useScopeSessionStore.setState({ snapshot });
  sovereignBus.emit('perspective:transition_completed', {
    activePerspective: snapshot.activePerspective,
  });
};

describe('authenticated v1 client', () => {
  it('sends the active account token on every request', async () => {
    const fetch = vi.fn(async () => Response.json({ json: issued(24) }));
    const v1 = createAuthenticatedV1Client({
      origin: 'https://api.example.test',
      getAccessToken: async () => 'token-1',
      fetch,
    });
    await v1.authority.refreshSnapshot({ bondId: bond.id }).catch(() => undefined);
    expect(fetch).toHaveBeenCalledTimes(1);
    const init = fetch.mock.calls[0]?.[1] as RequestInit | undefined;
    expect(new Headers(init?.headers).get('authorization')).toBe('Bearer token-1');
  });

  it('refuses locally without a token and never calls the server', async () => {
    const fetch = vi.fn(async () => Response.json({}));
    const v1 = createAuthenticatedV1Client({
      origin: 'https://api.example.test',
      getAccessToken: async () => null,
      fetch,
    });
    await expect(v1.identity.session()).rejects.toMatchObject({ code: 'UNAUTHORIZED' });
    expect(fetch).not.toHaveBeenCalled();
  });
});

describe('permission snapshot refresh', () => {
  let stop: (() => void) | undefined;
  let loadDecisions: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    writes.run.mockClear();
    loadDecisions = vi.fn(async () => undefined);
    useCedarDecisionStore.setState({ loadDecisions });
    useScopeSessionStore.setState({ snapshot: null });
  });
  afterEach(() => {
    stop?.();
    vi.useRealTimers();
  });

  it('stores the signed row on commit and reloads decisions, with no sync involved', async () => {
    const { refreshSnapshot, client: v1 } = client(async () => issued(24));
    stop = startPermissionSnapshotRefresh(v1);
    const committed = scope();
    commit(committed);
    await vi.waitFor(() => expect(refreshSnapshot).toHaveBeenCalledWith({ bondId: bond.id }));
    await vi.advanceTimersByTimeAsync(0);
    expect(writes.run).toHaveBeenCalledTimes(4);
    expect(loadDecisions).toHaveBeenCalledWith('account-1', PERSONAL_SCOPE_PERSPECTIVE.id);
  });

  it('reloads decisions again when sync later delivers a newer row', async () => {
    const { client: v1 } = client(async () => issued(24));
    stop = startPermissionSnapshotRefresh(v1);
    commit(scope());
    await vi.waitFor(() => expect(loadDecisions).toHaveBeenCalledTimes(1));
    await vi.advanceTimersByTimeAsync(0);
    sovereignBus.emit('sync:completed', { processedCount: 1, failedCount: 0 });
    expect(loadDecisions).toHaveBeenCalledTimes(2);
  });

  it('refreshes a scope already committed when it starts', async () => {
    const { refreshSnapshot, client: v1 } = client(async () => issued(24));
    useScopeSessionStore.setState({ snapshot: scope() });
    stop = startPermissionSnapshotRefresh(v1);
    await vi.waitFor(() => expect(refreshSnapshot).toHaveBeenCalledWith({ bondId: bond.id }));
  });

  it('refreshes again an hour before expiry', async () => {
    const { refreshSnapshot, client: v1 } = client(async () => issued(24));
    stop = startPermissionSnapshotRefresh(v1);
    commit(scope());
    await vi.waitFor(() => expect(refreshSnapshot).toHaveBeenCalledTimes(1));
    await vi.advanceTimersByTimeAsync(22 * 3_600_000);
    expect(refreshSnapshot).toHaveBeenCalledTimes(1);
    await vi.advanceTimersByTimeAsync(2 * 3_600_000);
    expect(refreshSnapshot).toHaveBeenCalledTimes(2);
  });

  it('drops a refresh whose scope was replaced while it ran', async () => {
    let finish: (value: ReturnType<typeof issued>) => void = () => undefined;
    const { client: v1 } = client(() => new Promise((resolve) => (finish = resolve)));
    stop = startPermissionSnapshotRefresh(v1);
    commit(scope());
    useScopeSessionStore.setState({ snapshot: scope({ ...bond, id: 'another-bond' }) });
    finish(issued(24));
    await vi.advanceTimersByTimeAsync(0);
    sovereignBus.emit('sync:completed', { processedCount: 1, failedCount: 0 });
    expect(writes.run).not.toHaveBeenCalled();
    expect(loadDecisions).not.toHaveBeenCalled();
  });

  it('does not retry when the server says no, but retries an outage', async () => {
    const denied = client(async () => {
      throw Object.assign(new Error('denied'), { code: 'FORBIDDEN' });
    });
    stop = startPermissionSnapshotRefresh(denied.client);
    commit(scope());
    await vi.waitFor(() => expect(denied.refreshSnapshot).toHaveBeenCalledTimes(1));
    await vi.advanceTimersByTimeAsync(60 * 60 * 1000);
    expect(denied.refreshSnapshot).toHaveBeenCalledTimes(1);
    stop();
    useScopeSessionStore.setState({ snapshot: null });

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    const down = client(async () => {
      throw Object.assign(new Error('down'), { code: 'SERVICE_UNAVAILABLE' });
    });
    stop = startPermissionSnapshotRefresh(down.client);
    commit(scope());
    await vi.waitFor(() => expect(down.refreshSnapshot).toHaveBeenCalledTimes(1));
    await vi.advanceTimersByTimeAsync(5 * 60 * 1000);
    expect(down.refreshSnapshot).toHaveBeenCalledTimes(2);
    warn.mockRestore();
  });

  it('does nothing for a scope without a bond', async () => {
    const { refreshSnapshot, client: v1 } = client(async () => issued(24));
    stop = startPermissionSnapshotRefresh(v1);
    commit(scope(null));
    await vi.advanceTimersByTimeAsync(1000);
    expect(refreshSnapshot).not.toHaveBeenCalled();
  });
});
