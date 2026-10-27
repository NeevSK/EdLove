import { getActiveAccountId, setActiveAccountId } from '@repo/core/lib/accountScope';
import {
  normalizeFeatureRolloutSnapshot,
  FEATURE_ROLLOUT_SNAPSHOT_MAX_AGE_MS as ttl,
} from '@repo/core/lib/featureRolloutSnapshot';
import type { FeatureRolloutSnapshot } from '@repo/core/logic/ports/featureRollout.port';
import { UserContextSchema } from '@repo/core/logic/schemas/user.schema';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const fixture = vi.hoisted(() => ({
  resolve: vi.fn(),
  read: vi.fn(),
  write: vi.fn().mockResolvedValue(undefined),
  unsubscribe: vi.fn(),
  listeners: [] as ((snapshot: FeatureRolloutSnapshot) => void)[],
}));
vi.mock('@repo/core/logic/managers/featureFlag.factory', () => ({
  featureFlags: {
    resolveFlags: fixture.resolve,
    subscribeToFlagChanges: (
      _context: unknown,
      callback: (snapshot: FeatureRolloutSnapshot) => void,
    ) => {
      fixture.listeners.push(callback);
      return fixture.unsubscribe;
    },
  },
}));
vi.mock('@repo/core/lib/storage', () => ({
  storage: { getStringAsync: fixture.read, setAsync: fixture.write },
}));

import { useFeatureStore } from '../useFeatureStore';

const context = (userId = 'account-a', pricing_tier = 'FREE') =>
  UserContextSchema.parse({ userId, pricing_tier });
const snapshot = (flags: FeatureRolloutSnapshot['flags'], age = 0): FeatureRolloutSnapshot => ({
  flags,
  source: 'remote',
  refreshedAt: new Date(Date.now() - age).toISOString(),
});
const flush = async () => {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
};
function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}

describe('Feature rollout owner (SDK and storage substituted)', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-26T00:00:00Z'));
    vi.clearAllMocks();
    fixture.listeners.length = 0;
    fixture.resolve.mockImplementation(() => new Promise(() => undefined));
    fixture.read.mockResolvedValue(undefined);
    setActiveAccountId('account-a');
  });
  afterEach(() => {
    useFeatureStore.getState().clear();
    setActiveAccountId(null);
    vi.useRealTimers();
  });

  it('drops temporary flags at expiry, retaining operational flags', () => {
    const result = normalizeFeatureRolloutSnapshot(
      snapshot({ isAIAssistantEnabled: true, isUnderMaintenance: false }, ttl),
    );
    expect(result.stale).toBe(true);
    expect(result.flags).toEqual({ isUnderMaintenance: false });
  });
  it('rejects future-dated snapshots', () => {
    expect(normalizeFeatureRolloutSnapshot(snapshot({ isInventoryEnabled: true }, -1)).stale).toBe(
      true,
    );
  });
  it('retains but does not adopt a record without network-freshness provenance', async () => {
    const ctx = context();
    fixture.read.mockResolvedValue(
      JSON.stringify({
        context: JSON.stringify(ctx),
        snapshot: snapshot({ isInventoryEnabled: true }),
      }),
    );
    useFeatureStore.getState().bindContext(ctx);
    await flush();
    expect(useFeatureStore.getState().snapshot).toBeNull();
    expect(fixture.write).not.toHaveBeenCalled();
  });
  it('resolves the exact context, projects booleans, and persists only a qualified snapshot', async () => {
    const ctx = context();
    fixture.resolve.mockResolvedValue(
      snapshot({ isInventoryEnabled: 'true', isUnderMaintenance: 'false' }),
    );
    useFeatureStore.getState().bindContext(ctx);
    await flush();
    expect(fixture.resolve).toHaveBeenCalledWith(ctx);
    expect(useFeatureStore.getState().flags).toMatchObject({
      isInventoryEnabled: true,
      isUnderMaintenance: false,
    });
    const [key, raw] = fixture.write.mock.calls[0]!;
    expect(key).toBe('gurudevi:account-a:feature-rollout:v2');
    expect(JSON.parse(raw)).toEqual({
      version: 2,
      context: JSON.stringify(ctx),
      snapshot: expect.objectContaining({
        flags: { isInventoryEnabled: 'true', isUnderMaintenance: 'false' },
      }),
    });
    expect(JSON.parse(raw)).not.toHaveProperty('flags');
  });
  it('uses defaults for empty flags and ignores unknown remote keys', async () => {
    fixture.resolve.mockResolvedValue(snapshot({ unknownFlag: true }));
    useFeatureStore.getState().bindContext(context());
    await flush();
    expect(useFeatureStore.getState().flags.isUnderMaintenance).toBe(false);
    expect(useFeatureStore.getState().flags).not.toHaveProperty('unknownFlag');
  });
  it('retains a matching saved snapshot after a remote failure', async () => {
    const ctx = context();
    fixture.read.mockResolvedValue(
      JSON.stringify({
        version: 2,
        context: JSON.stringify(ctx),
        snapshot: snapshot({ isInventoryEnabled: true }),
      }),
    );
    fixture.resolve.mockRejectedValue(new Error('503'));
    useFeatureStore.getState().bindContext(ctx);
    await flush();
    expect(useFeatureStore.getState().flags.isInventoryEnabled).toBe(true);
    expect(useFeatureStore.getState().snapshot?.source).toBe('cache');
    expect(fixture.write).not.toHaveBeenCalled();
  });
  it('expires a mounted snapshot without another fetch or render', async () => {
    fixture.resolve.mockResolvedValue(
      snapshot({ isInventoryEnabled: true, isUnderMaintenance: true }, ttl - 500),
    );
    useFeatureStore.getState().bindContext(context());
    await flush();
    expect(useFeatureStore.getState().flags.isInventoryEnabled).toBe(true);
    await vi.advanceTimersByTimeAsync(500);
    expect(useFeatureStore.getState().flags.isInventoryEnabled).toBe(false);
    expect(useFeatureStore.getState().flags.isUnderMaintenance).toBe(true);
    expect(fixture.resolve).toHaveBeenCalledTimes(1);
  });
  it('rejects old responses and subscription callbacks after context replacement', async () => {
    const first = deferred<FeatureRolloutSnapshot>();
    fixture.resolve
      .mockReturnValueOnce(first.promise)
      .mockResolvedValueOnce(snapshot({ isInventoryEnabled: false }));
    const endFirst = useFeatureStore.getState().bindContext(context());
    const oldListener = fixture.listeners[0]!;
    useFeatureStore.getState().bindContext(context('account-a', 'PRO'));
    await flush();
    first.resolve(snapshot({ isInventoryEnabled: true }));
    oldListener(snapshot({ isInventoryEnabled: true }));
    endFirst();
    await flush();
    expect(useFeatureStore.getState().flags.isInventoryEnabled).toBe(false);
    expect(fixture.write).toHaveBeenCalledTimes(1);
    expect(fixture.unsubscribe).toHaveBeenCalledTimes(1);
  });
  it('clear invalidates pending work and old listeners even before a new context binds', async () => {
    const pending = deferred<FeatureRolloutSnapshot>();
    fixture.resolve.mockReturnValue(pending.promise);
    useFeatureStore.getState().bindContext(context());
    useFeatureStore.getState().clear();
    fixture.listeners[0]!(snapshot({ isInventoryEnabled: true }));
    pending.resolve(snapshot({ isInventoryEnabled: true }));
    await flush();
    expect(useFeatureStore.getState().snapshot).toBeNull();
    expect(fixture.write).not.toHaveBeenCalled();
  });
  it('does not duplicate a commit or disk write for the same SDK evaluation', async () => {
    const value = snapshot({ isInventoryEnabled: true });
    fixture.resolve.mockResolvedValue(value);
    useFeatureStore.getState().bindContext(context());
    await flush();
    const projection = useFeatureStore.getState().flags;
    fixture.listeners[0]!(value);
    expect(useFeatureStore.getState().flags).toBe(projection);
    expect(fixture.write).toHaveBeenCalledTimes(1);
  });
  it('rejects account ABA late results even if no new provider effect has run', async () => {
    const pending = deferred<FeatureRolloutSnapshot>();
    fixture.resolve.mockReturnValue(pending.promise);
    useFeatureStore.getState().bindContext(context());
    setActiveAccountId('account-b');
    setActiveAccountId('account-a');
    pending.resolve(snapshot({ isInventoryEnabled: true }));
    await flush();
    expect(getActiveAccountId()).toBe('account-a');
    expect(useFeatureStore.getState().snapshot).toBeNull();
    expect(fixture.write).not.toHaveBeenCalled();
  });
  it('does not adopt saved evaluations for another entitlement context or overwrite a newer SDK result', async () => {
    fixture.read.mockResolvedValue(
      JSON.stringify({
        version: 2,
        context: JSON.stringify(context('account-a', 'PRO')),
        snapshot: snapshot({ isInventoryEnabled: true }),
      }),
    );
    useFeatureStore.getState().bindContext(context());
    await flush();
    expect(useFeatureStore.getState().snapshot).toBeNull();
    const cached = deferred<string>();
    fixture.read.mockReturnValue(cached.promise);
    fixture.resolve.mockResolvedValue(snapshot({ isInventoryEnabled: false }));
    const ctx = context();
    useFeatureStore.getState().bindContext(ctx);
    await flush();
    cached.resolve(
      JSON.stringify({
        version: 2,
        context: JSON.stringify(ctx),
        snapshot: snapshot({ isInventoryEnabled: true }),
      }),
    );
    await flush();
    expect(useFeatureStore.getState().flags.isInventoryEnabled).toBe(false);
  });
  it('diagnoses optional persistence failure without losing the active evaluation', async () => {
    fixture.write.mockRejectedValueOnce(new Error('disk full'));
    fixture.resolve.mockResolvedValue(snapshot({ isInventoryEnabled: true }));
    useFeatureStore.getState().bindContext(context());
    await flush();
    expect(useFeatureStore.getState().flags.isInventoryEnabled).toBe(true);
  });
  it('does not replace saved offline evaluation with an SDK that has no loaded payload', async () => {
    const ctx = context();
    fixture.read.mockResolvedValue(
      JSON.stringify({
        version: 2,
        context: JSON.stringify(ctx),
        snapshot: snapshot({ isInventoryEnabled: true }),
      }),
    );
    fixture.resolve.mockResolvedValue({ ...snapshot({}), source: 'computed' });
    useFeatureStore.getState().bindContext(ctx);
    await flush();
    expect(useFeatureStore.getState().flags.isInventoryEnabled).toBe(true);
    expect(fixture.write).not.toHaveBeenCalled();
  });
});
