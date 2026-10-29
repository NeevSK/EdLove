import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getToasts, resetToasts, subscribeToasts, toast } from '../toasts';

beforeEach(() => vi.useFakeTimers());
afterEach(() => {
  resetToasts();
  vi.useRealTimers();
});

describe('toast queue', { tags: ['unit', 'scenario'] }, () => {
  it('shows a toast, tells subscribers, and lets it go after its time', () => {
    const listener = vi.fn();
    const stop = subscribeToasts(listener);
    toast.show({ message: 'Attendance saved', tone: 'success' });
    expect(getToasts().map((t) => [t.message, t.tone])).toEqual([['Attendance saved', 'success']]);
    expect(listener).toHaveBeenCalledTimes(1);
    vi.advanceTimersByTime(4000);
    expect(getToasts()).toHaveLength(0);
    stop();
  });

  it('stays longer when there is something to do, and running the action dismisses it', () => {
    const undo = vi.fn();
    const id = toast.show({ message: 'Note deleted', action: { label: 'Undo', onPress: undo } });
    vi.advanceTimersByTime(4000);
    expect(getToasts()).toHaveLength(1);
    toast.act(id);
    expect(undo).toHaveBeenCalledTimes(1);
    expect(getToasts()).toHaveLength(0);
  });

  it('keeps at most three: the oldest leaves first', () => {
    for (const m of ['one', 'two', 'three', 'four']) toast.show({ message: m });
    expect(getToasts().map((t) => t.message)).toEqual(['two', 'three', 'four']);
  });

  it('dismissing an unknown or already gone toast changes nothing', () => {
    const listener = vi.fn();
    subscribeToasts(listener);
    toast.dismiss(999);
    expect(listener).not.toHaveBeenCalled();
  });
});
