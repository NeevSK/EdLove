export interface OptionalStartupTask {
  id: string;
  run: () => Promise<unknown>;
}

export interface OptionalStartupProgress {
  started: Set<string>;
  inFlight: Promise<void> | null;
}

export interface OptionalStartupScheduling {
  requestFrame: (callback: () => void) => number;
  cancelFrame: (id: number) => void;
  requestIdle: (callback: () => void) => number;
  cancelIdle: (id: number) => void;
  canRun: () => boolean;
  onError: (id: string, error: unknown) => void;
  onTrace?: (event: OptionalStartupWorkEvent) => void;
  now?: () => number;
}

export interface OptionalStartupWorkEvent {
  task: string;
  state: 'queued' | 'started' | 'completed' | 'failed' | 'denied' | 'cancelled';
  queueDepth: number;
  durationMs?: number;
  queueWaitMs?: number;
}

/** Only queued warmups are cancelable; an already-started import must settle. */
export function scheduleOptionalStartupWork(
  tasks: readonly OptionalStartupTask[],
  progress: OptionalStartupProgress,
  scheduling: OptionalStartupScheduling,
): () => void {
  let stopped = false;
  let frame: number | undefined;
  let idle: number | undefined;
  const remaining = tasks.filter((task) => !progress.started.has(task.id));
  const queuedAt = scheduling.onTrace
    ? new Map(remaining.map((task) => [task.id, scheduling.now?.() ?? 0]))
    : null;
  const trace = (event: OptionalStartupWorkEvent) => {
    if (!scheduling.onTrace) return;
    try {
      scheduling.onTrace?.(event);
    } catch {
      // Diagnostics cannot break optional work scheduling.
    }
  };
  remaining.forEach((task, index) =>
    trace({ task: task.id, state: 'queued', queueDepth: remaining.length - index }),
  );

  function scheduleNext(): void {
    if (stopped || remaining.length === 0) return;
    if (progress.inFlight) {
      void progress.inFlight.then(scheduleNext);
      return;
    }
    frame = scheduling.requestFrame(() => {
      frame = undefined;
      if (stopped) return;
      idle = scheduling.requestIdle(() => {
        idle = undefined;
        if (stopped) return;
        if (!scheduling.canRun()) {
          remaining.forEach((task) =>
            trace({ task: task.id, state: 'denied', queueDepth: remaining.length }),
          );
          return;
        }
        const task = remaining.shift();
        if (!task) return;
        if (progress.started.has(task.id)) {
          scheduleNext();
          return;
        }
        progress.started.add(task.id);
        const startedAt = scheduling.onTrace ? (scheduling.now?.() ?? 0) : null;
        if (startedAt !== null) {
          trace({
            task: task.id,
            state: 'started',
            queueDepth: remaining.length,
            queueWaitMs: Math.max(0, startedAt - (queuedAt?.get(task.id) ?? startedAt)),
          });
        }
        progress.inFlight = Promise.resolve()
          .then(task.run)
          .then(
            () =>
              trace({
                task: task.id,
                state: 'completed',
                queueDepth: remaining.length,
                ...(startedAt === null
                  ? {}
                  : { durationMs: Math.max(0, (scheduling.now?.() ?? startedAt) - startedAt) }),
              }),
            (error: unknown) => {
              trace({
                task: task.id,
                state: 'failed',
                queueDepth: remaining.length,
                ...(startedAt === null
                  ? {}
                  : { durationMs: Math.max(0, (scheduling.now?.() ?? startedAt) - startedAt) }),
              });
              scheduling.onError(task.id, error);
            },
          )
          .then(() => {
            progress.inFlight = null;
          });
        void progress.inFlight.then(scheduleNext);
      });
    });
  }

  scheduleNext();
  return () => {
    if (!stopped)
      remaining.forEach((task) =>
        trace({ task: task.id, state: 'cancelled', queueDepth: remaining.length }),
      );
    stopped = true;
    if (frame !== undefined) scheduling.cancelFrame(frame);
    if (idle !== undefined) scheduling.cancelIdle(idle);
  };
}
