import type {
  PracticeController,
  PracticeResult,
  PracticeValue,
  SyncPracticeController,
} from './practiceContract';

export type FeatureRuntimeMode = 'live' | 'practice';

/**
 * A feature-owned live adapter. It deliberately has the same lifecycle shape
 * as practice storage, while its implementation may use a remote API.
 */
export type FeatureLiveAdapter<T extends PracticeValue> = Readonly<{
  load(): PracticeResult<T>;
  save(value: T): PracticeResult<void>;
  reset(): PracticeResult<void>;
  discard(): PracticeResult<void>;
}>;

export type SyncFeatureLiveAdapter<T extends PracticeValue> = Readonly<{
  load(): T;
  save(value: T): void;
  reset(): void;
  discard(): void;
}>;

export type FeatureRuntime<T extends PracticeValue> = Readonly<{
  mode: FeatureRuntimeMode;
  load(): PracticeResult<T>;
  save(value: T): PracticeResult<void>;
  reset(): PracticeResult<void>;
  discard(): PracticeResult<void>;
}>;

export type SyncFeatureRuntime<T extends PracticeValue> = Readonly<{
  mode: FeatureRuntimeMode;
  load(): T;
  save(value: T): void;
  reset(): void;
  discard(): void;
}>;

/**
 * Selects a feature's live or Safe Try adapter once at entry. Renderers then
 * consume one stable runtime and cannot accidentally cross mode boundaries.
 */
export function createFeatureRuntime<T extends PracticeValue>(input: {
  mode: FeatureRuntimeMode;
  live?: SyncFeatureLiveAdapter<T>;
  practice?: SyncPracticeController<T>;
}): SyncFeatureRuntime<T>;
export function createFeatureRuntime<T extends PracticeValue>(input: {
  mode: FeatureRuntimeMode;
  live?: FeatureLiveAdapter<T>;
  practice?: PracticeController<T>;
}): FeatureRuntime<T>;
export function createFeatureRuntime<T extends PracticeValue>(input: {
  mode: FeatureRuntimeMode;
  live?: FeatureLiveAdapter<T> | SyncFeatureLiveAdapter<T>;
  practice?: PracticeController<T> | SyncPracticeController<T>;
}): FeatureRuntime<T> | SyncFeatureRuntime<T> {
  const adapter = input.mode === 'practice' ? input.practice : input.live;
  if (!adapter) {
    throw new Error(
      input.mode === 'practice'
        ? 'Safe Try is not available for this feature on this platform.'
        : 'Live feature access is not available for this feature on this platform.',
    );
  }

  return {
    mode: input.mode,
    load: () => adapter.load(),
    save: (value: T) => adapter.save(value),
    reset: () => adapter.reset(),
    discard: () => adapter.discard(),
  } as FeatureRuntime<T> | SyncFeatureRuntime<T>;
}
