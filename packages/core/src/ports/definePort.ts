/**
 * A room's data port: the one place a room asks for its records, so its screens
 * never know where the records come from. Each domain starts on a sample source
 * (the same samples web shows) and switches to the v1 server when that module is
 * admitted, by calling `use(serverPort)` once at boot. Screens do not change.
 */
export interface PortSource {
  /** 'sample' while the server module is a skeleton; 'server' once it answers. */
  readonly source: 'sample' | 'server';
}

export interface PortSlot<P extends PortSource> {
  /** The port in use now. */
  get(): P;
  /** Put another source in (the v1 adapter, a test double). */
  use(port: P): void;
  /** Back to the sample source. */
  reset(): void;
}

export function definePort<P extends PortSource>(sample: P): PortSlot<P> {
  let current = sample;
  return {
    get: () => current,
    use: (port) => {
      current = port;
    },
    reset: () => {
      current = sample;
    },
  };
}

/** Sample sources answer at once, but through a promise like a real one. */
export const answer = <T>(value: T, signal?: AbortSignal): Promise<T> =>
  signal?.aborted ? Promise.reject(signal.reason ?? new Error('aborted')) : Promise.resolve(value);
