import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const observeMock = vi.hoisted(() => ({ logEvent: vi.fn() }));

vi.mock('expo-observe', () => ({ Observe: { logEvent: observeMock.logEvent } }));

describe('runtime governor telemetry', () => {
  beforeEach(() => {
    observeMock.logEvent.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it('emits fixed low-cardinality admission and task outcome attributes', async () => {
    const { recordOptionalWorkFinished, recordRuntimeAdmission } = await import(
      '@/boot/runtimeGovernorTelemetry'
    );

    recordRuntimeAdmission({
      phase: 'protected-ready',
      capacityKnown: false,
      appState: 'active',
      pressure: 'constrained',
      batterySaver: false,
      optionalCap: 1,
      allowed: true,
      reason: 'eligible',
    });
    recordRuntimeAdmission({
      phase: 'protected-ready',
      capacityKnown: false,
      appState: 'active',
      pressure: 'constrained',
      batterySaver: false,
      optionalCap: 1,
      allowed: true,
      reason: 'eligible',
    });
    recordOptionalWorkFinished({
      task: 'background-sync-registration',
      outcome: 'complete',
      durationMs: 23.6,
    });

    expect(observeMock.logEvent).toHaveBeenNthCalledWith(1, 'runtime_admission_changed', {
      attributes: {
        phase: 'protected-ready',
        capacity_known: false,
        pressure_bucket: 'constrained',
        battery_saver: false,
        optional_cap: 1,
        allowed: true,
        reason: 'eligible',
      },
    });
    expect(observeMock.logEvent).toHaveBeenNthCalledWith(2, 'optional_work_finished', {
      attributes: {
        job_id: 'background-sync-registration',
        outcome: 'complete',
        duration_bucket: '16_49ms',
      },
    });
  });

  it('reports synchronous Observe call cost and trace writer overhead in development', async () => {
    vi.resetModules();
    vi.stubGlobal('__DEV__', true);
    const log = vi.spyOn(console, 'log').mockImplementation(() => undefined);
    const { recordRuntimeAdmission } = await import('@/boot/runtimeGovernorTelemetry');

    recordRuntimeAdmission({
      phase: 'public-ready',
      capacityKnown: true,
      appState: 'active',
      pressure: 'normal',
      batterySaver: false,
      optionalCap: 1,
      allowed: true,
      reason: 'eligible',
    });

    expect(log).toHaveBeenCalledTimes(2);
    expect(String(log.mock.calls[0]?.[0])).toContain('[Governor DEV]');
    expect(String(log.mock.calls[1]?.[0])).toContain('"category":"governor-overhead"');
    expect(String(log.mock.calls[1]?.[0])).toContain('"operation":"observe-log-event"');
    expect(String(log.mock.calls[1]?.[0])).toContain('"trace_session_started":true');
    expect(String(log.mock.calls[1]?.[0])).not.toContain('previous_trace_write_call_ms');
  });

  it('emits bounded runtime-condition events only when a coarse input changes', async () => {
    vi.resetModules();
    const { recordRuntimeConditionsChanged } = await import('@/boot/runtimeGovernorTelemetry');
    const initial = {
      appState: 'active' as const,
      batterySaver: false,
      memoryPressure: 'unknown' as const,
      thermalPressure: 'normal' as const,
      pressure: 'unknown' as const,
    };

    recordRuntimeConditionsChanged(initial);
    recordRuntimeConditionsChanged(initial);
    recordRuntimeConditionsChanged({
      ...initial,
      thermalPressure: 'constrained',
      pressure: 'constrained',
    });

    expect(observeMock.logEvent).toHaveBeenCalledTimes(2);
    expect(observeMock.logEvent).toHaveBeenLastCalledWith('runtime_conditions_changed', {
      attributes: {
        app_state: 'active',
        battery_saver: false,
        memory_pressure: 'unknown',
        thermal_pressure: 'constrained',
        pressure_bucket: 'constrained',
      },
    });
  });

  it('caps events and contains Observe failures', async () => {
    vi.resetModules();
    const { recordRuntimeAdmission } = await import('@/boot/runtimeGovernorTelemetry');
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);
    observeMock.logEvent.mockImplementation(() => {
      throw new Error('Observe unavailable');
    });
    const pressures = ['unknown', 'normal', 'constrained', 'severe'] as const;
    const reasons = ['eligible', 'background', 'constrained-pressure', 'severe-pressure'] as const;

    for (let index = 0; index < 70; index += 1) {
      const allowed = Math.floor(index / 8) % 2 === 0;
      recordRuntimeAdmission({
        phase: 'public-ready',
        capacityKnown: index % 2 === 0,
        appState: Math.floor(index / 16) % 2 === 0 ? 'active' : 'background',
        pressure: pressures[index % pressures.length] ?? 'unknown',
        batterySaver: Math.floor(index / 4) % 2 === 0,
        optionalCap: allowed ? 1 : 0,
        allowed,
        reason: reasons[Math.floor(index / 32) % reasons.length] ?? 'eligible',
      });
    }

    expect(observeMock.logEvent).toHaveBeenCalledTimes(64);
    expect(warn).toHaveBeenCalledOnce();
  });
});
