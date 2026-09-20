import { describe, expect, it, vi } from 'vitest';
import {
  completeEssentialStartup,
  type EssentialStartupDependencies,
} from '@/boot/startupCoordinator';

function neverSettles<T>(): Promise<T> {
  return new Promise<T>(() => {});
}

describe('essential startup coordinator', () => {
  it('enforces runtime → catalog → device-account ordering without optional services', async () => {
    const steps: string[] = [];

    await completeEssentialStartup({
      bootstrapPlatform: async () => {
        steps.push('runtime');
      },
      isRuntimeRegistered: () => true,
      loadCatalog: async () => ({
        registerAppCatalog: () => steps.push('catalog'),
      }),
      initializeDeviceAccounts: async () => {
        steps.push('accounts');
      },
    });

    expect(steps).toEqual(['runtime', 'catalog', 'accounts']);
  });

  it('does not mount catalog-dependent work when runtime registration fails', async () => {
    const loadCatalog = vi.fn();

    await expect(
      completeEssentialStartup({
        bootstrapPlatform: async () => undefined,
        isRuntimeRegistered: () => false,
        loadCatalog,
        initializeDeviceAccounts: vi.fn(),
      }),
    ).rejects.toThrow('Core runtime registration did not complete.');

    expect(loadCatalog).not.toHaveBeenCalled();
  });

  it('permits a clean retry after a failed runtime attempt', async () => {
    const bootstrapPlatform = vi
      .fn<() => Promise<void>>()
      .mockRejectedValueOnce(new Error('native adapter unavailable'))
      .mockResolvedValueOnce(undefined);
    const registerAppCatalog = vi.fn();

    const dependencies = {
      bootstrapPlatform,
      isRuntimeRegistered: () => true,
      loadCatalog: async () => ({ registerAppCatalog }),
      initializeDeviceAccounts: async () => undefined,
    };

    await expect(completeEssentialStartup(dependencies)).rejects.toThrow(
      'native adapter unavailable',
    );
    await expect(completeEssentialStartup(dependencies)).resolves.toBeUndefined();

    expect(registerAppCatalog).toHaveBeenCalledTimes(1);
  });
  it.each([
    [
      'bootstrapPlatform',
      {
        bootstrapPlatform: () => neverSettles<void>(),
        isRuntimeRegistered: () => true,
        loadCatalog: async () => ({ registerAppCatalog: vi.fn() }),
        initializeDeviceAccounts: async () => undefined,
      },
    ],
    [
      'loadCatalog',
      {
        bootstrapPlatform: async () => undefined,
        isRuntimeRegistered: () => true,
        loadCatalog: () => neverSettles<{ registerAppCatalog: () => void }>(),
        initializeDeviceAccounts: async () => undefined,
      },
    ],
    [
      'initializeDeviceAccounts',
      {
        bootstrapPlatform: async () => undefined,
        isRuntimeRegistered: () => true,
        loadCatalog: async () => ({ registerAppCatalog: vi.fn() }),
        initializeDeviceAccounts: () => neverSettles<void>(),
      },
    ],
  ] satisfies readonly [string, EssentialStartupDependencies][])(
    'turns a stalled %s stage into a named retryable failure',
    async (label, dependencies) => {
      vi.useFakeTimers();
      try {
        const startup = completeEssentialStartup(dependencies);
        const rejection = expect(startup).rejects.toThrow(
          `[boot] ${label} timed out after 200000ms`,
        );

        await vi.advanceTimersByTimeAsync(200_000);
        await rejection;
      } finally {
        vi.useRealTimers();
      }
    },
  );

  it('resolves normally when bootstrapPlatform completes before the deadline', async () => {
    vi.useFakeTimers();

    const steps: string[] = [];

    const startup = completeEssentialStartup({
      bootstrapPlatform: async () => {
        steps.push('runtime');
      },
      isRuntimeRegistered: () => true,
      loadCatalog: async () => ({ registerAppCatalog: () => steps.push('catalog') }),
      initializeDeviceAccounts: async () => {
        steps.push('accounts');
      },
    });

    // Let the fast bootstrap complete without hitting the deadline
    await vi.runAllTimersAsync();
    await startup;

    expect(steps).toEqual(['runtime', 'catalog', 'accounts']);

    vi.useRealTimers();
  });
});
