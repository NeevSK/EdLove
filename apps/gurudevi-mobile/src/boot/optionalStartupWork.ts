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
        if (stopped || !scheduling.canRun()) return;
        const task = remaining.shift();
        if (!task) return;
        if (progress.started.has(task.id)) {
          scheduleNext();
          return;
        }
        progress.started.add(task.id);
        progress.inFlight = Promise.resolve()
          .then(task.run)
          .catch((error: unknown) => scheduling.onError(task.id, error))
          .then(() => {
            progress.inFlight = null;
          });
        void progress.inFlight.then(scheduleNext);
      });
    });
  }

  scheduleNext();
  return () => {
    stopped = true;
    if (frame !== undefined) scheduling.cancelFrame(frame);
    if (idle !== undefined) scheduling.cancelIdle(idle);
  };
}
