import { describe, expect, it } from 'vitest';
import { type EfficiencyContext, evaluateEfficiency } from './policy';

const baseContext: EfficiencyContext = {
  appState: 'background',
  network: 'wifi',
  isMetered: false,
  batteryLevel: 0.8,
  isCharging: false,
  freeDiskBytes: 2 * 1024 * 1024 * 1024,
};

describe('evaluateEfficiency', () => {
  it('always allows user actions', () => {
    expect(
      evaluateEfficiency('user-action', { ...baseContext, network: 'offline', batteryLevel: 0.05 }),
    ).toEqual({ action: 'allow', reason: 'user_initiated' });
  });

  it('defers background sync on metered or offline networks', () => {
    expect(evaluateEfficiency('background-sync', { ...baseContext, isMetered: true }).action).toBe(
      'defer',
    );
    expect(
      evaluateEfficiency('background-sync', { ...baseContext, network: 'offline' }).reason,
    ).toBe('offline');
  });

  it('defers non-urgent work on low battery', () => {
    expect(
      evaluateEfficiency('media-prefetch', { ...baseContext, batteryLevel: 0.19 }).reason,
    ).toBe('low_battery');
  });

  it('reduces storage work when free disk is critical', () => {
    expect(
      evaluateEfficiency('storage-maintenance', {
        ...baseContext,
        freeDiskBytes: 50 * 1024 * 1024,
      }),
    ).toEqual({ action: 'reduce', reason: 'critical_free_disk' });
  });

  it('defers non-urgent work when battery state is unavailable or invalid', () => {
    expect(evaluateEfficiency('background-sync', { ...baseContext, batteryLevel: null })).toEqual({
      action: 'defer',
      reason: 'unknown_battery_state',
    });
    expect(
      evaluateEfficiency('media-prefetch', { ...baseContext, batteryLevel: Number.NaN }),
    ).toEqual({ action: 'defer', reason: 'unknown_battery_state' });
  });

  it('does not run background storage maintenance without disk visibility', () => {
    expect(
      evaluateEfficiency('storage-maintenance', { ...baseContext, freeDiskBytes: null }),
    ).toEqual({ action: 'defer', reason: 'unknown_free_disk' });
    expect(
      evaluateEfficiency('storage-maintenance', { ...baseContext, freeDiskBytes: Number.NaN }),
    ).toEqual({ action: 'defer', reason: 'unknown_free_disk' });
  });

  it('keeps charging devices eligible despite low battery', () => {
    expect(
      evaluateEfficiency('background-sync', {
        ...baseContext,
        batteryLevel: 0.05,
        isCharging: true,
      }),
    ).toEqual({ action: 'allow', reason: 'eligible' });
  });

  it('protects every non-urgent network operation on unknown connectivity', () => {
    for (const operation of ['background-sync', 'media-prefetch', 'analytics'] as const) {
      expect(evaluateEfficiency(operation, { ...baseContext, network: 'unknown' })).toEqual({
        action: 'defer',
        reason: 'unknown_network',
      });
    }
  });

  it('reduces cache writes and defers maintenance at the disk threshold', () => {
    const critical = { ...baseContext, freeDiskBytes: 99 * 1024 * 1024 };
    expect(evaluateEfficiency('cache-write', critical)).toEqual({
      action: 'reduce',
      reason: 'critical_free_disk',
    });
    expect(evaluateEfficiency('storage-maintenance', { ...critical, freeDiskBytes: null })).toEqual(
      {
        action: 'defer',
        reason: 'unknown_free_disk',
      },
    );
  });
});
