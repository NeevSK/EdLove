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

  it('reports measured startup stages without allowing telemetry to change startup', async () => {
    let time = 10;
    const stages: { stage: string; outcome: string; durationMs: number | null }[] = [];
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    try {
      await completeEssentialStartup({
        bootstrapPlatform: async () => {
          time += 4;
        },
        isRuntimeRegistered: () => true,
        loadCatalog: async () => {
          time += 3;
          return {
            registerAppCatalog: () => {
              time += 2;
            },
          };
        },
        initializeDeviceAccounts: async () => {
          time += 5;
        },
        now: () => time,
        onStage: (event) => {
          stages.push(event);
          if (stages.length === 1) throw new Error('telemetry unavailable');
        },
      });

      expect(stages).toEqual([
        { stage: 'bootstrapPlatform', outcome: 'complete', durationMs: 4 },
        { stage: 'runtimeRegistration', outcome: 'complete', durationMs: 0 },
        { stage: 'loadCatalog', outcome: 'complete', durationMs: 3 },
        { stage: 'registerAppCatalog', outcome: 'complete', durationMs: 2 },
        { stage: 'initializeDeviceAccounts', outcome: 'complete', durationMs: 5 },
      ]);
      expect(warn).toHaveBeenCalledOnce();
    } finally {
      warn.mockRestore();
    }
  });

  it('keeps startup alive and marks durations unavailable for invalid or regressing clocks', async () => {
    const invalidClockStages: { stage: string; durationMs: number | null }[] = [];
    await completeEssentialStartup({
      bootstrapPlatform: async () => undefined,
      isRuntimeRegistered: () => true,
      loadCatalog: async () => ({ registerAppCatalog: vi.fn() }),
      initializeDeviceAccounts: async () => undefined,
      now: () => Number.NaN,
      onStage: ({ stage, durationMs }) => invalidClockStages.push({ stage, durationMs }),
    });
    expect(invalidClockStages).toHaveLength(5);
    expect(invalidClockStages.every(({ durationMs }) => durationMs === null)).toBe(true);

    const clockValues = [5, 4];
    let callCount = 0;
    const regressingClockStages: { stage: string; durationMs: number | null }[] = [];
    await completeEssentialStartup({
      bootstrapPlatform: async () => undefined,
      isRuntimeRegistered: () => true,
      loadCatalog: async () => ({ registerAppCatalog: vi.fn() }),
      initializeDeviceAccounts: async () => undefined,
      now: () => clockValues[callCount++] ?? callCount,
      onStage: ({ stage, durationMs }) => regressingClockStages.push({ stage, durationMs }),
    });
    expect(regressingClockStages[0]).toEqual({ stage: 'bootstrapPlatform', durationMs: null });
    expect(regressingClockStages.slice(1).every(({ durationMs }) => durationMs !== null)).toBe(
      true,
    );
  });

  it('reports the original stage failure and clears its deadline timer', async () => {
    vi.useFakeTimers();
    const onStage = vi.fn();
    const failure = new Error('native adapter unavailable');

    try {
      await expect(
        completeEssentialStartup({
          bootstrapPlatform: async () => {
            throw failure;
          },
          isRuntimeRegistered: () => true,
          loadCatalog: async () => ({ registerAppCatalog: vi.fn() }),
          initializeDeviceAccounts: async () => undefined,
          onStage,
        }),
      ).rejects.toBe(failure);

      expect(onStage).toHaveBeenCalledWith({
        stage: 'bootstrapPlatform',
        outcome: 'failed',
        durationMs: expect.any(Number),
      });
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
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
        expect(vi.getTimerCount()).toBe(0);
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

    try {
      await startup;

      expect(steps).toEqual(['runtime', 'catalog', 'accounts']);
      expect(vi.getTimerCount()).toBe(0);
    } finally {
      vi.useRealTimers();
    }
  });
});
