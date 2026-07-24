import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFeatureSlice } from '../slices/feature.slice';

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
    get = vi.fn(() => ({ globalConfigs: {} }));
    slice = createFeatureSlice(set, get);
    vi.clearAllMocks();
  });

  describe('recomputeFlags', () => {
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
      const context = { userId: 'user-123' };
      mockResolveFlags.mockResolvedValue({
        flags: { isInventoryEnabled: true, isPaymentsEnabled: true },
        source: 'remote',
        refreshedAt: new Date().toISOString(),
      });

      slice.recomputeFlags(context as any);
      await vi.waitFor(() => {
        expect(set).toHaveBeenCalled();
      });

      const setCall = set.mock.calls[0][0];
      expect(setCall.flags.isInventoryEnabled).toBe(true);
      expect(setCall.flags.isPaymentsEnabled).toBe(true);
      expect(setCall.flags.isLibraryManagementEnabled).toBe(true);
    });

    it('keeps default flags when GrowthBook returns empty flags', async () => {
      mockResolveFlags.mockResolvedValue({
        flags: {},
        source: 'remote',
        refreshedAt: new Date().toISOString(),
      });

      slice.recomputeFlags({ userId: 'user-123' } as any);
      await vi.waitFor(() => {
        expect(set).toHaveBeenCalled();
      });

      const setCall = set.mock.calls[0][0];
      expect(setCall.flags.isLibraryManagementEnabled).toBe(true);
      expect(setCall.flags.isPaymentsEnabled).toBe(false);
    });

    it('keeps existing flags on GrowthBook rejection', async () => {
      mockResolveFlags.mockRejectedValue(new Error('Network error'));

      slice.recomputeFlags({ userId: 'user-123' } as any);

      await vi.waitFor(() => {
        expect(set).not.toHaveBeenCalled();
      });
    });

    it('applies global config overrides on top of GrowthBook flags', async () => {
      get = vi.fn(() => ({ globalConfigs: { isAIAssistantEnabled: true } }));
      slice = createFeatureSlice(set, get);

      mockResolveFlags.mockResolvedValue({
        flags: { isAIAssistantEnabled: false },
        source: 'remote',
        refreshedAt: new Date().toISOString(),
      });

      slice.recomputeFlags({ userId: 'user-123' } as any);
      await vi.waitFor(() => {
        expect(set).toHaveBeenCalled();
      });

      const setCall = set.mock.calls[0][0];
      expect(setCall.flags.isAIAssistantEnabled).toBe(true);
    });

    it('converts string "true"/"false" values to booleans', async () => {
      mockResolveFlags.mockResolvedValue({
        flags: { isInventoryEnabled: 'true', isPaymentsEnabled: 'false' },
        source: 'remote',
        refreshedAt: new Date().toISOString(),
      });

      slice.recomputeFlags({ userId: 'user-123' } as any);
      await vi.waitFor(() => {
        expect(set).toHaveBeenCalled();
      });

      const setCall = set.mock.calls[0][0];
      expect(setCall.flags.isInventoryEnabled).toBe(true);
      expect(setCall.flags.isPaymentsEnabled).toBe(false);
    });
  });
});
