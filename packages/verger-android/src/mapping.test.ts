import { DEFAULT_GOVERNOR_CONFIG, UNKNOWN_CAPACITY } from '@repo/verger-core';
import { describe, expect, it } from 'vitest';
import { FRAME_WINDOW_MS, senseConfigFrom, toCapacityFacts, toGovernorEvent } from './mapping';

describe('verger-android mapping', () => {
  it('sends the governor thresholds, so native code holds no copy of a tunable', () => {
    expect(senseConfigFrom(DEFAULT_GOVERNOR_CONFIG)).toEqual({
      windowMs: FRAME_WINDOW_MS,
      minSamples: DEFAULT_GOVERNOR_CONFIG.minSamples,
      stressRatio: DEFAULT_GOVERNOR_CONFIG.stressRatio,
      stressDroppedRatio: DEFAULT_GOVERNOR_CONFIG.stressDroppedRatio,
      comfortRatio: DEFAULT_GOVERNOR_CONFIG.comfortRatio,
      comfortDroppedRatio: DEFAULT_GOVERNOR_CONFIG.comfortDroppedRatio,
      jankFrameFactor: DEFAULT_GOVERNOR_CONFIG.jankFrameFactor,
      headroomWarm: DEFAULT_GOVERNOR_CONFIG.headroomWarm,
      saturationCores: DEFAULT_GOVERNOR_CONFIG.saturationCores,
    });
  });

  it('treats an absent module as unknown capacity', () => {
    expect(toCapacityFacts(undefined)).toEqual(UNKNOWN_CAPACITY);
  });

  it('keeps only finite capacity facts', () => {
    const facts = toCapacityFacts({
      totalMemoryBytes: 7_853_694_976,
      isLowRamDevice: false,
      memoryClassMb: 256,
      sdkInt: 34,
      cpuCores: 8,
      refreshRateHz: Number.NaN,
      supportsRenderEffect: true,
      supportsRuntimeShader: true,
      supportsThermalHeadroom: true,
    });
    expect(facts.refreshRateHz).toBeNull();
    expect(facts.sdkInt).toBe(34);
    expect(facts).not.toHaveProperty('supportsThermalHeadroom');
  });

  it('maps each native event to the governor vocabulary on the JS clock', () => {
    const window = {
      startMs: 500,
      endMs: 1000,
      frames: 30,
      averageMs: 7.8,
      targetMs: 16.674,
      worstMs: 18.4,
      droppedRatio: 0.03,
    };
    expect(
      toGovernorEvent({ name: 'onFrameWindow', payload: { ...window, state: 'neutral' } }, 42),
    ).toEqual({
      type: 'frame-window',
      at: 42,
      window,
    });
    expect(
      toGovernorEvent({ name: 'onThermal', payload: { status: 'light', headroom: Number.NaN } }, 1),
    ).toEqual({
      type: 'thermal',
      at: 1,
      status: 'light',
      headroom: null,
    });
    expect(
      toGovernorEvent({ name: 'onMemoryTrim', payload: { severity: 'low', level: 60 } }, 2),
    ).toEqual({
      type: 'memory-trim',
      at: 2,
      severity: 'low',
    });
    expect(toGovernorEvent({ name: 'onPowerSaver', payload: { saver: true } }, 3)).toEqual({
      type: 'power',
      at: 3,
      saver: true,
    });
  });

  it('carries frame stages, thread load and polled memory into the governor vocabulary', () => {
    const stages = { uiMs: 9, renderMs: 3, gpuMs: 4, delayMs: 0.5 };
    const window = {
      startMs: 0,
      endMs: 500,
      frames: 45,
      averageMs: 17,
      targetMs: 11.1,
      worstMs: 30,
      droppedRatio: 0.2,
    };
    expect(
      toGovernorEvent(
        { name: 'onFrameWindow', payload: { ...window, state: 'stressed', stages } },
        5,
      ),
    ).toEqual({
      type: 'frame-window',
      at: 5,
      window: { ...window, stages },
    });
    expect(
      toGovernorEvent(
        { name: 'onFrameWindow', payload: { ...window, state: 'stressed', stages: null } },
        5,
      ),
    ).toEqual({
      type: 'frame-window',
      at: 5,
      window,
    });
    expect(
      toGovernorEvent(
        {
          name: 'onThreadLoad',
          payload: {
            intervalMs: 1000,
            processCores: 1.4,
            cores: { js: 0.9, main: 0.3 },
            topOtherName: 'OkHttp',
            topOtherCores: 0.1,
            rssMb: 310,
          },
        },
        7,
      ),
    ).toEqual({ type: 'thread-load', at: 7, cores: { js: 0.9, main: 0.3 }, processCores: 1.4 });
    expect(
      toGovernorEvent(
        {
          name: 'onMemory',
          payload: { availableMb: 420, thresholdMb: 216, lowMemory: false, rssMb: 300 },
        },
        8,
      ),
    ).toEqual({
      type: 'memory-state',
      at: 8,
      availableMb: 420,
      thresholdMb: 216,
      lowMemory: false,
    });
  });

  it('turns an unreported GPU time into NaN, never 0', () => {
    const window = {
      startMs: 0,
      endMs: 500,
      frames: 30,
      averageMs: 9,
      targetMs: 16.7,
      worstMs: 12,
      droppedRatio: 0,
    };
    const event = toGovernorEvent(
      {
        name: 'onFrameWindow',
        payload: {
          ...window,
          state: 'calm',
          stages: { uiMs: 5, renderMs: 3, gpuMs: null, delayMs: 0 },
        },
      },
      1,
    );
    expect(event.type === 'frame-window' && Number.isNaN(event.window.stages?.gpuMs)).toBe(true);
  });

  it('keeps only valid refresh rates and reads hint support', () => {
    const facts = toCapacityFacts({
      refreshRatesHz: [60, Number.NaN, 90, -1],
      supportsCpuHints: true,
    });
    expect(facts.refreshRatesHz).toEqual([60, 90]);
    expect(facts.supportsCpuHints).toBe(true);
  });
});
