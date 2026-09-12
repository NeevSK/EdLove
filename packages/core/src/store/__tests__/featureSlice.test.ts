import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import {
  createFeatureSlice,
  FEATURE_ROLLOUT_SNAPSHOT_MAX_AGE_MS,
  normalizeFeatureRolloutSnapshot,
} from '../slices/feature.slice';

const mockResolveFlags = vi.fn();

vi.mock('../../logic/managers/featureFlag.factory', () => ({
  featureFlags: {
    resolveFlags: (...args: any[]) => mockResolveFlags(...args),
  },
}));

describe('featureSlice', () => {
  let set: ReturnType<typeof vi.fn>;
  let get: ReturnType<typeof vi.fn>;
  let slice: ReturnType<typeof createFeatureSlice>;

  beforeEach(() => {
    set = vi.fn();
    get = vi.fn(() => ({ applySnapshot: vi.fn() }));
    slice = createFeatureSlice(set as any, get as any, {} as any);
    vi.clearAllMocks();
  });

  async function resolveAndReadFlags(flags: Record<string, boolean | string>) {
    mockResolveFlags.mockResolvedValue({
      flags,
      source: 'remote',
      refreshedAt: new Date().toISOString(),
    });

    slice.recomputeFlags({ userId: 'user-123' } as any);
    await vi.waitFor(() => {
      expect(set).toHaveBeenCalled();
    });

    return (set.mock.calls[0]?.[0] as any).flags;
  }

  it('fails closed for temporary flags in an expired snapshot', () => {
    const now = Date.parse('2026-07-26T00:00:00.000Z');
    const snapshot = normalizeFeatureRolloutSnapshot(
      {
        flags: { isAIAssistantEnabled: true, isUnderMaintenance: false },
        source: 'cache',
        refreshedAt: new Date(now - FEATURE_ROLLOUT_SNAPSHOT_MAX_AGE_MS - 1).toISOString(),
      },
      now,
    );

    expect(snapshot.stale).toBe(true);
    expect(snapshot.flags).toEqual({ isUnderMaintenance: false });
  });

  describe('recomputeFlags', () => {
    it('ignores a stale rollout response after a newer context recompute', async () => {
      let resolveFirst: (snapshot: unknown) => void = () => undefined;
      let resolveSecond: (snapshot: unknown) => void = () => undefined;
      const first = new Promise((resolve) => {
        resolveFirst = resolve;
      });
      const second = new Promise((resolve) => {
        resolveSecond = resolve;
      });
      mockResolveFlags.mockReturnValueOnce(first).mockReturnValueOnce(second);

      slice.recomputeFlags({ userId: 'first-user' } as any);
      slice.recomputeFlags({ userId: 'second-user' } as any);

      resolveSecond({
        flags: { isInventoryEnabled: true },
        source: 'remote',
        refreshedAt: new Date().toISOString(),
      });
      await vi.waitFor(() => expect(set).toHaveBeenCalledTimes(1));

      resolveFirst({
        flags: { isInventoryEnabled: false },
        source: 'remote',
        refreshedAt: new Date().toISOString(),
      });
      await Promise.resolve();

      expect(set).toHaveBeenCalledTimes(1);
    });

    it('calls resolveFlags with the provided context', () => {
      const context = { userId: 'user-123', email: 'test@test.com' };
      mockResolveFlags.mockResolvedValue({
        flags: {},
        source: 'remote',
        refreshedAt: new Date().toISOString(),
      });

      slice.recomputeFlags(context as any);

      expect(mockResolveFlags).toHaveBeenCalledWith(context);
    });

    it('updates state with resolved flags, merged with defaults', async () => {
      const flags = await resolveAndReadFlags({
        isInventoryEnabled: true,
        isUnderMaintenance: false,
      });
      expect(flags.isInventoryEnabled).toBe(true);
      expect(flags.isUnderMaintenance).toBe(false);
    });

    it('keeps default flags when GrowthBook returns empty flags', async () => {
      const flags = await resolveAndReadFlags({});
      expect(flags.isUnderMaintenance).toBe(false);
    });

    it('keeps existing flags on GrowthBook rejection', async () => {
      mockResolveFlags.mockRejectedValue(new Error('Network error'));

      slice.recomputeFlags({ userId: 'user-123' } as any);

      await vi.waitFor(() => {
        expect(set).not.toHaveBeenCalled();
      });
    });

    it('converts string "true"/"false" values to booleans', async () => {
      const flags = await resolveAndReadFlags({
        isInventoryEnabled: 'true',
        isUnderMaintenance: 'true',
      });
      expect(flags.isInventoryEnabled).toBe(true);
      expect(flags.isUnderMaintenance).toBe(true);
    });
  });
});
