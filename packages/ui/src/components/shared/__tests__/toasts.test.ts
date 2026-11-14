import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { getToasts, getWaitingCount, resetToasts, toast } from '../toasts';

const messages = () => getToasts().map((t) => t.message);

describe('toast queue / G1, fake timers', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => {
    resetToasts();
    vi.useRealTimers();
  });

  it('picks a size from what the toast carries', () => {
    toast.show({ message: 'Saved' });
    toast.show({ message: 'Moved', action: { label: 'Undo', onPress: () => undefined } });
    toast.show({ message: 'Offline', size: 'banner' });
    expect(getToasts().map((t) => t.size)).toEqual(['pill', 'card', 'banner']);
  });

  it('leaves on its own after its time, longer with an action; a banner stays', () => {
    toast.show({ message: 'Saved' });
    toast.show({ message: 'Moved', action: { label: 'Undo', onPress: () => undefined } });
    toast.show({ message: 'Offline', size: 'banner' });
    vi.advanceTimersByTime(4000);
    expect(messages()).toEqual(['Moved', 'Offline']);
    vi.advanceTimersByTime(3000);
    expect(messages()).toEqual(['Offline']);
    vi.advanceTimersByTime(60_000);
    expect(messages()).toEqual(['Offline']);
  });

  it('counts the same news up instead of stacking it, and restarts its time', () => {
    toast.show({ message: 'Could not sync', tone: 'danger', key: 'sync' });
    vi.advanceTimersByTime(3000);
    toast.show({ message: 'Could not sync', tone: 'danger', key: 'sync' });
    expect(getToasts()).toHaveLength(1);
    expect(getToasts()[0]).toMatchObject({ count: 2, revision: 1 });
    vi.advanceTimersByTime(3000);
    expect(getToasts()).toHaveLength(1);
  });

  it('updates in place by key with new words, starting the count over', () => {
    toast.show({ message: 'Uploading', key: 'upload' });
    toast.show({ message: 'Uploaded', tone: 'success', key: 'upload' });
    expect(getToasts()).toEqual([expect.objectContaining({ message: 'Uploaded', count: 1, tone: 'success' })]);
  });

  it('makes room for fresh news, but never pushes out an important or working toast', () => {
    toast.show({ message: 'Danger', tone: 'danger' });
    toast.show({ message: 'One' });
    toast.show({ message: 'Two' });
    toast.show({ message: 'Three' });
    expect(messages()).toEqual(['Danger', 'Two', 'Three']);
    resetToasts();
    toast.show({ message: 'A', important: true });
    toast.show({ message: 'B', important: true });
    toast.show({ message: 'C', important: true });
    toast.show({ message: 'D' });
    expect(messages()).toEqual(['A', 'B', 'C']);
    expect(getWaitingCount()).toBe(1);
    toast.dismiss(getToasts()[0]?.id ?? -1);
    expect(messages()).toEqual(['B', 'C', 'D']);
  });

  it('waits while held or hidden, then finishes the time that was left', () => {
    const id = toast.show({ message: 'Saved' });
    vi.advanceTimersByTime(3000);
    toast.pause(id);
    vi.advanceTimersByTime(10_000);
    expect(messages()).toEqual(['Saved']);
    toast.resume(id);
    vi.advanceTimersByTime(900);
    expect(messages()).toEqual(['Saved']);
    vi.advanceTimersByTime(200);
    expect(messages()).toEqual([]);

    toast.show({ message: 'Hidden' });
    toast.pause();
    toast.show({ message: 'While hidden' });
    vi.advanceTimersByTime(60_000);
    expect(messages()).toEqual(['Hidden', 'While hidden']);
    toast.resume();
    vi.advanceTimersByTime(4000);
    expect(messages()).toEqual([]);
  });

  it('follows a promise in one toast: working, then done, then gone', async () => {
    vi.useRealTimers();
    let finish: (value: string) => void = () => undefined;
    const work = new Promise<string>((resolve) => {
      finish = resolve;
    });
    toast.promise(work, { loading: 'Saving…', success: (name) => `Saved ${name}`, error: 'Could not save' });
    expect(getToasts()).toEqual([expect.objectContaining({ message: 'Saving…', pending: true })]);
    finish('notes');
    await work;
    await Promise.resolve();
    expect(getToasts()).toEqual([
      expect.objectContaining({ message: 'Saved notes', tone: 'success', pending: false }),
    ]);
  });

  it('turns a failed promise into a danger toast that offers the retry', async () => {
    vi.useRealTimers();
    const retry = { label: 'Retry', onPress: vi.fn() };
    const work = Promise.reject(new Error('offline'));
    await toast
      .promise(work, { loading: 'Saving…', success: 'Saved', error: 'Could not save', retry })
      .catch(() => undefined);
    await Promise.resolve();
    expect(getToasts()[0]).toMatchObject({ message: 'Could not save', tone: 'danger', action: retry });
    toast.act(getToasts()[0]?.id ?? -1);
    expect(retry.onPress).toHaveBeenCalledOnce();
    expect(getToasts()).toHaveLength(0);
  });
});
