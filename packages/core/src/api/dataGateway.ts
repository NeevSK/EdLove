import { type ResilienceOptions, withResilience } from '@/offline/resilience';

export interface LocalFirstReadOptions<T> extends ResilienceOptions {
  fetchRemote: () => Promise<T>;
}

export async function readLocalFirst<T>(options: LocalFirstReadOptions<T>): Promise<T | null> {
  return withResilience(options.fetchRemote, options);
}

export interface LocalFirstWriteOptions<TPayload, TResult> {
  queueKey: string;
  optimistic?: TResult;
  enqueueLocal: (payload: TPayload) => Promise<void> | void;
  commitRemote: (payload: TPayload) => Promise<TResult>;
  onCommitted?: (result: TResult) => Promise<void> | void;
}

/**
 * Data Gateway
 *
 * This is the first-class local-first boundary for app data.
 * It keeps the offline cache in front, lets the queue capture deferred writes,
 * and only delegates remote authority to the Sanctuary API through the provided
 * transport functions.
 */
export async function writeLocalFirst<TPayload, TResult>(
  payload: TPayload,
  options: LocalFirstWriteOptions<TPayload, TResult>,
): Promise<TResult> {
  await options.enqueueLocal(payload);
  const result = await options.commitRemote(payload);
  if (options.onCommitted) {
    await options.onCommitted(result);
  }
  return result;
}
