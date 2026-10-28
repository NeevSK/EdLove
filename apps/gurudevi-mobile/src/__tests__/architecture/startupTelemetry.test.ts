import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const observeMock = vi.hoisted(() => ({ logEvent: vi.fn() }));
const catcherMock = vi.hoisted(() => ({ record: vi.fn() }));
const sourceMock = vi.hoisted(() => vi.fn());

vi.mock('expo-observe', () => ({ Observe: { logEvent: observeMock.logEvent } }));
vi.mock('@/telemetry/devTelemetryCatcher', () => ({
  devTelemetryCatcher: { record: catcherMock.record },
}));
vi.mock('@/telemetry/localDevelopmentTelemetry', () => ({
  setDevelopmentTelemetrySource: sourceMock,
}));

describe('startup stage telemetry', () => {
  beforeEach(() => {
    observeMock.logEvent.mockReset();
    catcherMock.record.mockReset();
    sourceMock.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('uses the Expo Observe logEvent options shape with fixed stage attributes', async () => {
    const { recordStartupStage } = await import('@/boot/startupTelemetry');

    expect(() =>
      recordStartupStage({
        stage: 'initializeDeviceAccounts',
        outcome: 'failed',
        durationMs: 23.5,
        startedAtMs: 11,
        finishedAtMs: 34,
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
    expect(catcherMock.record).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        name: 'initializeDeviceAccounts',
        attributes: expect.objectContaining({
          category: 'essential-stage',
          state: 'started',
          at_ms: 11,
        }),
      }),
      { print: false },
    );
    expect(catcherMock.record).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        name: 'initializeDeviceAccounts',
        durationMs: 23.5,
        attributes: expect.objectContaining({
          category: 'essential-stage',
          state: 'failed',
          at_ms: 34,
        }),
      }),
      { print: false },
    );

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
    vi.stubEnv('EXPO_PUBLIC_GURUDEVI_TRACE_CONSOLE', 'true');
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
      wall_time_ms: expect.any(Number),
      at_ms: expect.any(Number),
      time_origin_ms: expect.any(Number),
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

  it('serializes bounded admission inputs needed to explain a governor decision', async () => {
    vi.stubGlobal('__DEV__', true);
    vi.stubEnv('EXPO_PUBLIC_GURUDEVI_TRACE_CONSOLE', 'true');
    vi.resetModules();
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const { recordDevelopmentTrace } = await import('@/boot/startupTelemetry');

    recordDevelopmentTrace({
      category: 'admission',
      phase: 'protected-ready',
      app_state: 'active',
      pressure_bucket: 'unknown',
      capacity_known: true,
      battery_saver: false,
      optional_cap: 1,
      allowed: true,
      reason: 'eligible',
      queue_depth: 2,
      account_id: 'must-not-be-recorded',
    });

    const trace = JSON.parse(String(log.mock.calls[0]?.[0]).replace(/^\[runtime-trace\] /, ''));
    expect(trace).toMatchObject({
      category: 'admission',
      phase: 'protected-ready',
      app_state: 'active',
      pressure_bucket: 'unknown',
      capacity_known: true,
      battery_saver: false,
      optional_cap: 1,
      allowed: true,
      reason: 'eligible',
      queue_depth: 2,
    });
    expect(trace).not.toHaveProperty('account_id');
  });

  it('records only the fixed development screen readiness buckets', async () => {
    vi.stubGlobal('__DEV__', true);
    vi.stubEnv('EXPO_PUBLIC_GURUDEVI_TRACE_CONSOLE', 'true');
    vi.resetModules();
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const { recordDevelopmentScreenInteractive } = await import('@/boot/startupTelemetry');

    recordDevelopmentScreenInteractive('onboarding');
    recordDevelopmentScreenInteractive('self');

    const traces = log.mock.calls.map(([line]) =>
      JSON.parse(String(line).replace(/^\[runtime-trace\] /, '')),
    );
    expect(traces).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: 'screen-interactive',
          task: 'onboarding',
          state: 'ready',
        }),
        expect.objectContaining({ category: 'screen-interactive', task: 'self', state: 'ready' }),
      ]),
    );
  });

  it('retains local trace capture while keeping Metro quiet by default', async () => {
    vi.stubGlobal('__DEV__', true);
    vi.resetModules();
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const { recordDevelopmentTrace } = await import('@/boot/startupTelemetry');

    recordDevelopmentTrace({ category: 'startup', task: 'first-shell-frame', state: 'committed' });

    expect(log).not.toHaveBeenCalled();
    expect(catcherMock.record).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'first-shell-frame' }),
      { print: false },
    );
  });

  it('keeps the original Event Timing start and labels its estimated wall clock', async () => {
    vi.stubGlobal('__DEV__', true);
    let deliver: PerformanceObserverCallback | undefined;
    class Observer {
      static supportedEntryTypes = ['event'];
      constructor(callback: PerformanceObserverCallback) {
        deliver = callback;
      }
      observe() {}
      disconnect() {}
    }
    vi.stubGlobal('PerformanceObserver', Observer);
    vi.resetModules();
    const { observeDevelopmentInteractions } = await import('@/boot/startupTelemetry');
    const stop = observeDevelopmentInteractions();
    const event = {
      name: 'click',
      startTime: 10,
      duration: 30,
      processingStart: 15,
      processingEnd: 20,
    };
    deliver?.(
      { getEntries: () => [event] } as unknown as PerformanceObserverEntryList,
      {} as PerformanceObserver,
    );

    expect(catcherMock.record).toHaveBeenCalledWith(
      expect.objectContaining({
        attributes: expect.objectContaining({
          at_ms: 10,
          input_delay_ms: 5,
          processing_ms: 5,
          presentation_delay_ms: 20,
          wall_clock_basis: 'estimated-from-observation',
        }),
      }),
      { print: false },
    );
    stop();
  });

  it('keeps the capped source status after the observer stops', async () => {
    vi.stubGlobal('__DEV__', true);
    let deliver: PerformanceObserverCallback | undefined;
    class Observer {
      static supportedEntryTypes = ['event'];
      constructor(callback: PerformanceObserverCallback) {
        deliver = callback;
      }
      observe() {}
      disconnect() {}
    }
    vi.stubGlobal('PerformanceObserver', Observer);
    vi.resetModules();
    const { observeDevelopmentInteractions } = await import('@/boot/startupTelemetry');
    const stop = observeDevelopmentInteractions();
    const event = { name: 'click', startTime: 10, duration: 30 };
    deliver?.(
      {
        getEntries: () => Array.from({ length: 2049 }, () => event),
      } as PerformanceObserverEntryList,
      {} as PerformanceObserver,
    );
    stop();
    expect(sourceMock).toHaveBeenLastCalledWith(
      'event-timing',
      'capped',
      'Development Event Timing entry cap reached.',
    );
  });
});
