import { runHardwareCalibration } from '@repo/verger-react';
import { describe, expect, it } from 'vitest';

describe('runHardwareCalibration (first-run empirical hardware benchmark)', () => {
  it('executes within bounds and computes normalized score and tier', async () => {
    const result = await runHardwareCalibration({ jitterSamples: 2 });
    expect(result.score).toBeGreaterThan(0);
    expect(result.score).toBeLessThanOrEqual(1.0);
    expect(['low', 'mid', 'high']).toContain(result.tier);
    expect(result.eventLoopJitterMs).toBeGreaterThanOrEqual(0);
    expect(result.computeDurationMs).toBeGreaterThan(0);
    expect(result.completedAt).toBeGreaterThan(0);
  });

  it('determines high tier when jitter and compute are minimal', async () => {
    let mockTime = 1000;
    // Clock advances by exact expected interval (4ms per jitter sample, 0.5ms for compute)
    const mockNow = () => {
      mockTime += 1;
      return mockTime;
    };
    const result = await runHardwareCalibration({
      jitterSamples: 2,
      now: mockNow,
    });
    expect(result.tier).toBe('high');
    expect(result.score).toBeGreaterThanOrEqual(0.8);
  });
});

