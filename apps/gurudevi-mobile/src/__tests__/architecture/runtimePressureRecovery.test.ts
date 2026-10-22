import { afterEach, describe, expect, it, vi } from 'vitest';
import { createRuntimePressureRecovery } from '@/boot/runtimePressureRecovery';

describe('runtime pressure recovery window', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('holds observed pressure until a later native snapshot reports it cleared', () => {
    vi.useFakeTimers();
    const onSnapshot = vi.fn();
    const recovery = createRuntimePressureRecovery(onSnapshot, 30_000);
    const constrained = { memory: 'unknown' as const, thermal: 'constrained' as const };

    recovery.update(constrained);
    vi.advanceTimersByTime(60_000);
    expect(onSnapshot).toHaveBeenLastCalledWith(constrained);
    expect(onSnapshot).toHaveBeenCalledTimes(1);

    recovery.update({ memory: 'unknown', thermal: 'normal' });
    vi.advanceTimersByTime(29_999);
    expect(onSnapshot).toHaveBeenCalledTimes(2);
    vi.advanceTimersByTime(1);
    expect(onSnapshot).toHaveBeenLastCalledWith({ memory: 'unknown', thermal: 'unknown' });
  });

  it('restarts the recovery window when pressure returns and cancels it on cleanup', () => {
    vi.useFakeTimers();
    const onSnapshot = vi.fn();
    const recovery = createRuntimePressureRecovery(onSnapshot, 30_000);
    recovery.update({ memory: 'severe', thermal: 'unknown' });
    recovery.update({ memory: 'unknown', thermal: 'normal' });
    vi.advanceTimersByTime(20_000);
    recovery.update({ memory: 'constrained', thermal: 'normal' });
    vi.advanceTimersByTime(30_000);
    expect(onSnapshot).toHaveBeenLastCalledWith({ memory: 'constrained', thermal: 'normal' });
    recovery.dispose();
    expect(vi.getTimerCount()).toBe(0);
    recovery.update({ memory: 'severe', thermal: 'normal' });
    expect(onSnapshot).toHaveBeenCalledTimes(3);
  });
});
