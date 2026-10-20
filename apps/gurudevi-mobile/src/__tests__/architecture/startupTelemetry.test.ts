import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const observeMock = vi.hoisted(() => ({ logEvent: vi.fn() }));

vi.mock('expo-observe', () => ({ Observe: { logEvent: observeMock.logEvent } }));

describe('startup stage telemetry', () => {
  beforeEach(() => {
    observeMock.logEvent.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('uses the Expo Observe logEvent options shape with fixed stage attributes', async () => {
    const { recordStartupStage } = await import('@/boot/startupTelemetry');

    expect(() =>
      recordStartupStage({
        stage: 'initializeDeviceAccounts',
        outcome: 'failed',
        durationMs: 23.5,
      }),
    ).not.toThrow();

    await vi.waitFor(() => expect(observeMock.logEvent).toHaveBeenCalledTimes(1));
    expect(observeMock.logEvent).toHaveBeenCalledWith('startup_stage', {
      attributes: {
        stage: 'initializeDeviceAccounts',
        outcome: 'failed',
        duration_ms: 23.5,
      },
    });

    recordStartupStage({
      stage: 'loadCatalog',
      outcome: 'complete',
      durationMs: null,
    });
    expect(observeMock.logEvent).toHaveBeenLastCalledWith('startup_stage', {
      attributes: { stage: 'loadCatalog', outcome: 'complete' },
    });
  });

  it('caps startup records and contains Observe logging failures', async () => {
    vi.resetModules();
    const { recordStartupStage } = await import('@/boot/startupTelemetry');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    observeMock.logEvent.mockImplementation(() => {
      throw new Error('Observe unavailable');
    });

    for (let index = 0; index < 70; index += 1) {
      expect(() =>
        recordStartupStage({
          stage: 'loadCatalog',
          outcome: 'complete',
          durationMs: index,
        }),
      ).not.toThrow();
    }

    expect(observeMock.logEvent).toHaveBeenCalledTimes(64);
    expect(warn).toHaveBeenCalledOnce();
    expect(warn).toHaveBeenCalledWith('[startup] Observe stage telemetry is unavailable.');
  });
});
