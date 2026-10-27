import { afterEach, describe, expect, it, vi } from 'vitest';
import { SingleActivePowerSyncRuntime } from '../singleActivePowerSyncRuntime';

vi.mock('@repo/core/api/highways', () => ({ assertPowerSyncBootstrapReady: vi.fn() }));
vi.mock('@repo/core/logic/runtimeRegistry', () => ({
  coreRuntime: { isRegistered: () => true },
}));
vi.mock('@powersync/drizzle-driver', () => ({ wrapPowerSyncWithDrizzle: vi.fn() }));
vi.mock('@repo/core/adapters/powersync/schema', () => ({ AppSchema: {} }));
vi.mock('@repo/core/adapters/powersync/secureDrizzleProxy', () => ({
  createSecureDrizzleProxy: vi.fn((database: object) => database),
}));

afterEach(() => vi.resetModules());

describe.each(['native', 'web'])(
  'G1 %s database facade ownership / substituted SDK and bootstrap',
  (platform) => {
    async function facade() {
      return platform === 'native' ? import('../database') : import('../database.web');
    }

    it('denies accessor reads after ownership is revoked while retaining release for retry', async () => {
      const api = await facade();
      const database = { close: vi.fn().mockResolvedValue(undefined) };
      const drizzle = {};
      let active = true;
      const release = vi
        .fn()
        .mockRejectedValueOnce(new Error('close failed'))
        .mockResolvedValue(undefined);
      api.injectNativePowerSyncDB(database, drizzle, { isActive: () => active, release });
      expect(api.getPowerSyncDB()).toBe(database);
      expect(api.getDrizzleDB()).toBe(drizzle);
      active = false;
      expect(api.getActivePowerSyncDB()).toBeNull();
      expect(() => api.getPowerSyncDB()).toThrow('account runtime is inactive');
      expect(() => api.getDrizzleDB()).toThrow('account runtime is inactive');
      await expect(api.disconnectPowerSync({ clear: true })).rejects.toThrow('close failed');
      await api.disconnectPowerSync({ clear: true });
      expect(release.mock.calls).toEqual([[true], [true]]);
      expect(database.close).not.toHaveBeenCalled();
      expect(api.getActivePowerSyncDB()).toBeNull();
    });

    it('serializes facade logout with switching and cannot close or forget the replacement', async () => {
      const api = await facade();
      const runtime = new SingleActivePowerSyncRuntime<{ close: () => Promise<void> }>();
      const first = { close: vi.fn().mockResolvedValue(undefined) };
      const second = { close: vi.fn().mockResolvedValue(undefined) };
      await runtime.activate('account-a', async () => first);
      api.injectNativePowerSyncDB(
        first,
        {},
        {
          isActive: () => runtime.isActive('account-a', first),
          release: (clear) => runtime.deactivateIfCurrent(first, clear),
        },
      );
      const switching = runtime.activate('account-b', async () => {
        api.injectNativePowerSyncDB(
          second,
          {},
          {
            isActive: () => runtime.isActive('account-b', second),
            release: (clear) => runtime.deactivateIfCurrent(second, clear),
          },
        );
        return second;
      });
      const delayedLogout = api.disconnectPowerSync();
      await Promise.all([switching, delayedLogout]);
      expect(first.close).toHaveBeenCalledOnce();
      expect(second.close).not.toHaveBeenCalled();
      expect(api.getPowerSyncDB()).toBe(second);
      await api.disconnectPowerSync();
      expect(second.close).toHaveBeenCalledOnce();
    });

    it('retains a failed queued release for retry without exposing the partially closed handle', async () => {
      const api = await facade();
      const runtime = new SingleActivePowerSyncRuntime<{ close: () => Promise<void> }>();
      const database = {
        close: vi
          .fn()
          .mockRejectedValueOnce(new Error('partial close'))
          .mockResolvedValue(undefined),
      };
      await runtime.activate('account-a', async () => database);
      api.injectNativePowerSyncDB(
        database,
        {},
        {
          isActive: () => runtime.isActive('account-a', database),
          release: (clear) => runtime.deactivateIfCurrent(database, clear),
        },
      );
      await expect(api.disconnectPowerSync()).rejects.toThrow('partial close');
      expect(api.getActivePowerSyncDB()).toBeNull();
      expect(() => api.getDrizzleDB()).toThrow('account runtime is inactive');
      expect(runtime.activeAccountId).toBe('account-a');
      await api.disconnectPowerSync();
      expect(database.close).toHaveBeenCalledTimes(2);
      expect(runtime.activeAccountId).toBeNull();
    });

    it('retains the current injection when securing a replacement throws', async () => {
      const api = await facade();
      const { createSecureDrizzleProxy } = await import('../secureDrizzleProxy');
      const first = { close: vi.fn().mockResolvedValue(undefined) };
      const second = { close: vi.fn().mockResolvedValue(undefined) };
      const drizzle = {};
      api.injectNativePowerSyncDB(first, drizzle);
      vi.mocked(createSecureDrizzleProxy).mockImplementationOnce(() => {
        throw new Error('proxy initialization failed');
      });
      expect(() => api.injectNativePowerSyncDB(second, {})).toThrow('proxy initialization failed');
      expect(api.getActivePowerSyncDB()).toBe(first);
      expect(api.getDrizzleDB()).toBe(drizzle);
      await api.disconnectPowerSync();
      expect(first.close).toHaveBeenCalledOnce();
      expect(second.close).not.toHaveBeenCalled();
    });

    it('keeps legacy disconnect-only and explicit-clear injection behavior', async () => {
      const api = await facade();
      const database = { disconnect: vi.fn().mockResolvedValue(undefined) };
      api.injectNativePowerSyncDB(database, {});
      await api.disconnectPowerSync();
      expect(database.disconnect).toHaveBeenCalledOnce();
      const clearable = {
        disconnectAndClear: vi.fn().mockResolvedValue(undefined),
        close: vi.fn().mockResolvedValue(undefined),
      };
      api.injectNativePowerSyncDB(clearable, {});
      await api.clearPowerSyncAccount();
      expect(clearable.disconnectAndClear).toHaveBeenCalledOnce();
      expect(clearable.close).not.toHaveBeenCalled();
    });

    it('preserves a new injection when legacy cleanup finishes later', async () => {
      const api = await facade();
      let finish!: () => void;
      const first = {
        close: vi.fn(
          () =>
            new Promise<void>((resolve) => {
              finish = resolve;
            }),
        ),
      };
      const second = { close: vi.fn().mockResolvedValue(undefined) };
      api.injectNativePowerSyncDB(first, {});
      const logout = api.disconnectPowerSync();
      api.injectNativePowerSyncDB(second, {});
      finish();
      await logout;
      expect(api.getPowerSyncDB()).toBe(second);
      expect(second.close).not.toHaveBeenCalled();
      await api.disconnectPowerSync();
    });
  },
);
