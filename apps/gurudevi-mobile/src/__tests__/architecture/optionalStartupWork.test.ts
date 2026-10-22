import { describe, expect, it, vi } from 'vitest';
import {
  type OptionalStartupProgress,
  scheduleOptionalStartupWork,
} from '@/boot/optionalStartupWork';

function harness() {
  let nextId = 0;
  const frames = new Map<number, () => void>();
  const idle = new Map<number, () => void>();
  const scheduling = {
    requestFrame: (callback: () => void) => {
      frames.set(++nextId, callback);
      return nextId;
    },
    cancelFrame: (id: number) => {
      frames.delete(id);
    },
    requestIdle: (callback: () => void) => {
      idle.set(++nextId, callback);
      return nextId;
    },
    cancelIdle: (id: number) => {
      idle.delete(id);
    },
    canRun: vi.fn(() => true),
    onError: vi.fn(),
  };
  const flush = (callbacks: Map<number, () => void>) => {
    const pending = [...callbacks.values()];
    callbacks.clear();
    pending.forEach((callback) => callback());
  };
  return { scheduling, frames, idle, frame: () => flush(frames), slice: () => flush(idle) };
}

const progress = (): OptionalStartupProgress => ({ started: new Set(), inFlight: null });

describe('optional startup warmup scheduling', () => {
  it('requires a frame and idle slice and runs only one task at a time', async () => {
    const h = harness();
    const state = progress();
    let complete: () => void = () => {};
    const first = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          complete = resolve;
        }),
    );
    const second = vi.fn(async () => {});
    scheduleOptionalStartupWork(
      [
        { id: 'first', run: first },
        { id: 'second', run: second },
      ],
      state,
      h.scheduling,
    );
    expect(first).not.toHaveBeenCalled();
    h.frame();
    expect(first).not.toHaveBeenCalled();
    h.slice();
    await Promise.resolve();
    expect(first).toHaveBeenCalledOnce();
    expect(second).not.toHaveBeenCalled();
    complete();
    await state.inFlight;
    h.frame();
    h.slice();
    await state.inFlight;
    expect(second).toHaveBeenCalledOnce();
  });

  it('does not start denied work and cancels queued callbacks', () => {
    const h = harness();
    const task = { id: 'task', run: vi.fn(async () => {}) };
    h.scheduling.canRun.mockReturnValue(false);
    const cancel = scheduleOptionalStartupWork([task], progress(), h.scheduling);
    h.frame();
    h.slice();
    expect(task.run).not.toHaveBeenCalled();
    cancel();
    const cancelNext = scheduleOptionalStartupWork([task], progress(), h.scheduling);
    cancelNext();
    expect(h.frames.size).toBe(0);
  });

  it('reports failure and permits the next optional task', async () => {
    const h = harness();
    const state = progress();
    const failure = new Error('registration unavailable');
    const next = vi.fn(async () => {});
    scheduleOptionalStartupWork(
      [
        {
          id: 'bad',
          run: async () => {
            throw failure;
          },
        },
        { id: 'next', run: next },
      ],
      state,
      h.scheduling,
    );
    h.frame();
    h.slice();
    await state.inFlight;
    expect(h.scheduling.onError).toHaveBeenCalledWith('bad', failure);
    h.frame();
    h.slice();
    await state.inFlight;
    expect(next).toHaveBeenCalledOnce();
  });

  it('reports per-task queue wait, execution duration, and queue depth', async () => {
    const h = harness();
    const state = progress();
    const events: Array<{
      state: string;
      queueDepth: number;
      durationMs?: number;
      queueWaitMs?: number;
    }> = [];
    let now = 10;
    scheduleOptionalStartupWork(
      [
        {
          id: 'measured',
          run: async () => {
            now = 37;
          },
        },
      ],
      state,
      { ...h.scheduling, now: () => now, onTrace: (event) => events.push(event) },
    );
    now = 25;
    h.frame();
    h.slice();
    await state.inFlight;
    expect(events).toEqual([
      { task: 'measured', state: 'queued', queueDepth: 1 },
      { task: 'measured', state: 'started', queueDepth: 0, queueWaitMs: 15 },
      { task: 'measured', state: 'completed', queueDepth: 0, durationMs: 12 },
    ]);
  });

  it('keeps the concurrency cap across effect cleanup and replacement', async () => {
    const h = harness();
    const state = progress();
    let complete: () => void = () => {};
    const first = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          complete = resolve;
        }),
    );
    const second = vi.fn(async () => {});
    const tasks = [
      { id: 'one', run: first },
      { id: 'two', run: second },
    ];
    const cancel = scheduleOptionalStartupWork(tasks, state, h.scheduling);
    h.frame();
    h.slice();
    await Promise.resolve();
    cancel();
    scheduleOptionalStartupWork(tasks, state, h.scheduling);
    h.frame();
    h.slice();
    expect(second).not.toHaveBeenCalled();
    complete();
    await state.inFlight;
    h.frame();
    h.slice();
    await state.inFlight;
    expect(first).toHaveBeenCalledOnce();
    expect(second).toHaveBeenCalledOnce();
  });
});
