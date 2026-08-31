import { describe, expect, it } from 'vitest';
import { classifyMemoryTier, normalizeNetworkConditions } from './runtimeConditions';

describe('runtime condition normalization', () => {
  it('uses one memory-tier boundary for all consumers', () => {
    const GB = 1024 * 1024 * 1024;
    expect(classifyMemoryTier(2 * GB)).toBe('low');
    expect(classifyMemoryTier(4 * GB)).toBe('medium');
    expect(classifyMemoryTier(8 * GB)).toBe('high');
    expect(classifyMemoryTier(null)).toBe('medium');
    expect(classifyMemoryTier(Number.NaN)).toBe('medium');
    expect(classifyMemoryTier(Number.POSITIVE_INFINITY)).toBe('medium');
  });

  it('normalizes network type, quality, and metering together', () => {
    expect(
      normalizeNetworkConditions({
        isConnected: true,
        type: 'cellular',
        details: { cellularGeneration: '5g' },
      }),
    ).toEqual({ type: 'cellular', quality: 'excellent', isMetered: true });
    expect(normalizeNetworkConditions({ isConnected: false, type: 'none' })).toEqual({
      type: 'offline',
      quality: 'offline',
      isMetered: false,
    });
    expect(normalizeNetworkConditions({ isConnected: null, type: 'none' })).toEqual({
      type: 'unknown',
      quality: 'poor',
      isMetered: false,
    });
    expect(normalizeNetworkConditions({ isConnected: null, type: 'wifi' })).toEqual({
      type: 'unknown',
      quality: 'poor',
      isMetered: false,
    });
    expect(
      normalizeNetworkConditions({ isConnected: true, type: 'wifi', isMetered: true }),
    ).toEqual({ type: 'wifi', quality: 'good', isMetered: true });
    expect(
      normalizeNetworkConditions({
        isConnected: true,
        type: 'cellular',
        details: { cellularGeneration: '2g' },
      }),
    ).toEqual({ type: 'cellular', quality: 'poor', isMetered: true });
  });
});
