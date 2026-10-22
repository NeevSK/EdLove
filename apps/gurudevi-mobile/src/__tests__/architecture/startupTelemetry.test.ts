import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const observeMock = vi.hoisted(() => ({ logEvent: vi.fn() }));

vi.mock('expo-observe', () => ({ Observe: { logEvent: observeMock.logEvent } }));

describe('startup stage telemetry', () => {
  beforeEach(() => {
    observeMock.logEvent.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
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

  it('traces deferred startup task completion and failure locally in development', async () => {
    vi.stubGlobal('__DEV__', true);
    vi.resetModules();
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const { measureDevelopmentStartupTask } = await import('@/boot/startupTelemetry');

    await expect(
      measureDevelopmentStartupTask('workflow-event-bridge', async () => 'ready'),
    ).resolves.toBe('ready');
    await expect(
      measureDevelopmentStartupTask('install-referrer-resolution', async () => {
        throw new Error('offline');
      }),
    ).rejects.toThrow('offline');

    expect(log).toHaveBeenCalledTimes(4);
    const traceEvents = log.mock.calls.map(([line]) =>
      JSON.parse(String(line).replace(/^\[runtime-trace\] /, '')),
    );
    expect(traceEvents[0]).toMatchObject({
      trace_session_started: true,
      trace_event_index: 1,
    });
    expect(traceEvents[1]).toMatchObject({
      trace_session_id: traceEvents[0].trace_session_id,
      trace_session_started: false,
      trace_event_index: 2,
    });
    expect(log.mock.calls.map(([line]) => String(line))).toEqual(
      expect.arrayContaining([
        expect.stringContaining('"task":"workflow-event-bridge"'),
        expect.stringContaining('"task":"install-referrer-resolution"'),
        expect.stringContaining('"state":"failed"'),
      ]),
    );
  });
});
