import {
  resolveAccountPracticeWriteDecision,
  type AccountPracticeScope,
} from './practiceBoundary';

export type PracticeValue = object;
export type PracticeResult<T> = T | Promise<T>;

/** Feature-owned storage port shared by web and native Safe Try adapters. */
export type PracticeAdapter<T extends PracticeValue> = Readonly<{
  load(): PracticeResult<T>;
  save(value: T): PracticeResult<void>;
  reset(): PracticeResult<void>;
  discard(): PracticeResult<void>;
}>;

export type SyncPracticeAdapter<T extends PracticeValue> = Readonly<{
  load(): T;
  save(value: T): void;
  reset(): void;
  discard(): void;
}>;

export type PracticeController<T extends PracticeValue> = Readonly<{
  load(): PracticeResult<T>;
  save(value: T): PracticeResult<void>;
  reset(): PracticeResult<void>;
  discard(): PracticeResult<void>;
}>;

export type SyncPracticeController<T extends PracticeValue> = Readonly<{
  load(): T;
  save(value: T): void;
  reset(): void;
  discard(): void;
}>;

/**
 * Wraps a feature adapter with the shared lifecycle and write boundary. The
 * adapter owns storage details; this controller owns when practice may write.
 */
export function createPracticeController<T extends PracticeValue>(input: {
  scope: AccountPracticeScope;
  adapter: SyncPracticeAdapter<T>;
}): SyncPracticeController<T>;
export function createPracticeController<T extends PracticeValue>(input: {
  scope: AccountPracticeScope;
  adapter: PracticeAdapter<T>;
}): PracticeController<T> {
  let active = true;

  function requireActive(): void {
    if (!active) throw new Error('This Safe Try workspace has ended. Start it again to continue.');
  }

  function requireLocalWrite(): void {
    const decision = resolveAccountPracticeWriteDecision(input.scope, 'local');
    if (!decision.allowed) throw new Error('Safe Try storage is unavailable for this workspace.');
  }

  return {
    load: () => {
      requireActive();
      return input.adapter.load();
    },
    save: (value) => {
      requireActive();
      requireLocalWrite();
      return input.adapter.save(value);
    },
    reset: () => {
      requireActive();
      requireLocalWrite();
      return input.adapter.reset();
    },
    discard: () => {
      requireActive();
      requireLocalWrite();
      active = false;
      return input.adapter.discard();
    },
  };
}
