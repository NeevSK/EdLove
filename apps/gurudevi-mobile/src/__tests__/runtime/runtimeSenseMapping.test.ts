import { DEFAULT_GOVERNOR_CONFIG, UNKNOWN_CAPACITY } from '@repo/core/governor';
import { describe, expect, it } from 'vitest';
import {
  FRAME_WINDOW_MS,
  senseConfigFrom,
  toCapacityFacts,
  toGovernorEvent,
} from '../../../modules/runtime-sense/src/mapping';

describe('runtime-sense mapping', () => {
  it('sends the governor thresholds, so native code holds no copy of a tunable', () => {
    expect(senseConfigFrom(DEFAULT_GOVERNOR_CONFIG)).toEqual({
      windowMs: FRAME_WINDOW_MS,
      minSamples: DEFAULT_GOVERNOR_CONFIG.minSamples,
      stressRatio: DEFAULT_GOVERNOR_CONFIG.stressRatio,
      stressDroppedRatio: DEFAULT_GOVERNOR_CONFIG.stressDroppedRatio,
      comfortRatio: DEFAULT_GOVERNOR_CONFIG.comfortRatio,
      comfortDroppedRatio: DEFAULT_GOVERNOR_CONFIG.comfortDroppedRatio,
      headroomWarm: DEFAULT_GOVERNOR_CONFIG.headroomWarm,
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
    expect(toGovernorEvent({ name: 'onFrameWindow', payload: { ...window, state: 'neutral' } }, 42)).toEqual({
      type: 'frame-window',
      at: 42,
      window,
    });
    expect(toGovernorEvent({ name: 'onThermal', payload: { status: 'light', headroom: Number.NaN } }, 1)).toEqual({
      type: 'thermal',
      at: 1,
      status: 'light',
      headroom: null,
    });
    expect(toGovernorEvent({ name: 'onMemoryTrim', payload: { severity: 'low', level: 60 } }, 2)).toEqual({
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
});
