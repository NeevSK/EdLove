import { collectRealitySignals } from '@repo/ui/context/realitySignals';
import type { RealityState } from '@repo/ui/context/types';
import { describe, expect, it } from 'vitest';

const previous: RealityState = {
  deviceTier: 'high',
  totalMemoryGB: 8,
  networkQuality: 'good',
  isDataSaverMode: false,
  isBatterySaverMode: false,
  isReducedMotionEnabled: false,
};

describe('collectRealitySignals', () => {
  it('retains previous values when readers throw synchronously or asynchronously', async () => {
    const result = await collectRealitySignals(previous, true, {
      readDevice: () => {
        throw new Error('device unavailable');
      },
      readNetwork: async () => {
        throw new Error('network unavailable');
      },
      readPower: () => {
        throw new Error('power unavailable');
      },
    });

    expect(result.failureCount).toBe(3);
    expect(result.reality).toEqual({ ...previous, isReducedMotionEnabled: true });
  });

  it('merges successful signals while preserving unrelated last-known state', async () => {
    const result = await collectRealitySignals(previous, false, {
      readDevice: async () => ({ tier: 'low', memoryGB: 2 }),
      readNetwork: async () => 'offline',
      readPower: async () => ({ lowPowerMode: true }),
    });

    expect(result.failureCount).toBe(0);
    expect(result.reality).toEqual({
      ...previous,
      deviceTier: 'low',
      totalMemoryGB: 2,
      networkQuality: 'offline',
      isDataSaverMode: true,
      isBatterySaverMode: true,
    });
  });

  it('does not require an optional power reader', async () => {
    const result = await collectRealitySignals(previous, false, {
      readDevice: async () => ({ tier: 'medium', memoryGB: 4 }),
      readNetwork: async () => 'fair',
    });

    expect(result.failureCount).toBe(0);
    expect(result.reality).toEqual({
      ...previous,
      deviceTier: 'medium',
      totalMemoryGB: 4,
      networkQuality: 'fair',
      isDataSaverMode: false,
    });
  });
});
