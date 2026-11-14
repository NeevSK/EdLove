import { createVerger, GURUDEVI_MOBILE_HOST, UNKNOWN_CAPACITY } from '@repo/core/verger';
import { bindVerger, reportVergerInteraction } from '@repo/verger-react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const verger = () =>
  createVerger({
    host: GURUDEVI_MOBILE_HOST,
    platform: () => ({
      readCapacity: () => UNKNOWN_CAPACITY,
      memorySensing: false,
      createPort: () => ({ start: () => () => {}, setRefreshCap: () => {}, setCpuBoost: () => {} }),
    }),
    requested: 'shadow',
    release: 'presence-test',
    now: () => performance.now(),
  });

const cleanup: Array<() => void | Promise<void>> = [];
afterEach(async () => {
  for (const stop of cleanup.splice(0).reverse()) await stop();
  vi.restoreAllMocks();
});

describe('presence from an existing host root / substituted platform', () => {
  it('never claims a responder and stays inert when unbound or not started', () => {
    expect(reportVergerInteraction()).toBe(false);
    const instance = verger();
    cleanup.push(bindVerger(instance));
    const dispatch = vi.spyOn(instance, 'dispatch');
    expect(reportVergerInteraction()).toBe(false);
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('throttles presence and stops reporting after the runtime stops', async () => {
    const clock = vi.spyOn(performance, 'now').mockReturnValue(1000);
    const instance = verger();
    cleanup.push(() => instance.stop(), bindVerger(instance));
    await instance.start();
    const dispatch = vi.spyOn(instance, 'dispatch');
    expect(reportVergerInteraction()).toBe(false);
    clock.mockReturnValue(1100);
    reportVergerInteraction();
    clock.mockReturnValue(1250);
    reportVergerInteraction();
    expect(dispatch.mock.calls.filter(([e]) => e.type === 'interaction')).toHaveLength(2);
    await instance.stop();
    dispatch.mockClear();
    clock.mockReturnValue(1500);
    reportVergerInteraction();
    expect(dispatch).not.toHaveBeenCalled();
  });

  it('does not let the previous binding throttle the next runtime', async () => {
    vi.spyOn(performance, 'now').mockReturnValue(2000);
    const first = verger();
    const second = verger();
    cleanup.push(
      () => first.stop(),
      () => second.stop(),
    );
    await first.start();
    cleanup.push(bindVerger(first));
    reportVergerInteraction();
    await second.start();
    cleanup.push(bindVerger(second));
    const dispatch = vi.spyOn(second, 'dispatch');
    reportVergerInteraction();
    expect(dispatch).toHaveBeenCalledWith({ type: 'interaction', at: 2000 });
  });
});
