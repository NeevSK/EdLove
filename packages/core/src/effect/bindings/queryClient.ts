import { presentFailure } from '@repo/core/lib/failureFeedback.adapter';
import { classifyFailure, isRetryable, retryDelayMs } from '@repo/core/logic/failure/classifyFailure';
import {
  type DefaultOptions,
  MutationCache,
  QueryCache,
  type QueryClientConfig,
} from '@tanstack/react-query';

/**
 * How queries and mutations fail, retry and tell the person, for every QueryClient in the apps.
 * Each app keeps its own platform settings (focus, online manager, SSR dehydration) and passes
 * them as `defaultOptions`; this supplies the parts that must be the same everywhere:
 *
 * - **Retry by kind.** Only transient kinds are retried (`RETRY_POLICY`); sign-out, forbidden,
 *   validation and conflicts fail at once instead of three times. Unrecognised failures
 *   (defects) keep TanStack's old behaviour for queries, two retries. Mutations aren't retried
 *   here: offline writes go through the outbox.
 * - **Backoff** with full jitter, or the server's own `retryAfterMs` for a rate limit.
 * - **Feedback.** A failed mutation is shown through the feedback table (`presentFailure`) unless
 *   its caller handles it: its own `onError`, or `meta: { feedback: 'silent' }`. A failed query
 *   is shown only when it was a background refresh over data already on screen; otherwise the
 *   screen's error state covers it. Either way the diagnosis goes to telemetry when the person
 *   can't act on it.
 *
 * See docs/architecture/2026-11-12-client-runtime-foundation-plan.md, L4 and L5.
 */
export type FeedbackMode = 'auto' | 'silent';

declare module '@tanstack/react-query' {
  interface Register {
    queryMeta: { feedback?: FeedbackMode; operation?: string };
    mutationMeta: { feedback?: FeedbackMode; operation?: string };
  }
}

/** Query retries for transient kinds and for defects; TanStack's old default was 3 for all. */
export const MAX_QUERY_RETRIES = 2;

export function shouldRetryQuery(failureCount: number, error: unknown): boolean {
  if (failureCount >= MAX_QUERY_RETRIES) return false;
  const kind = classifyFailure(error);
  return kind === null || isRetryable(kind);
}

const operationOf = (key: readonly unknown[]) =>
  key.filter((part): part is string => typeof part === 'string').join('.') || undefined;

export function queryClientConfig(defaultOptions: DefaultOptions = {}): QueryClientConfig {
  return {
    queryCache: new QueryCache({
      onError: (error, query) => {
        if (query.meta?.feedback === 'silent' || query.state.data === undefined) return;
        presentFailure(error, query.meta?.operation ?? operationOf(query.queryKey));
      },
    }),
    mutationCache: new MutationCache({
      onError: (error, _variables, _result, mutation) => {
        if (mutation.meta?.feedback === 'silent' || mutation.options.onError) return;
        const key = mutation.options.mutationKey;
        presentFailure(error, mutation.meta?.operation ?? (key ? operationOf(key) : undefined));
      },
    }),
    defaultOptions: {
      ...defaultOptions,
      queries: {
        retry: shouldRetryQuery,
        retryDelay: (attempt, error) => retryDelayMs(attempt, error),
        ...defaultOptions.queries,
      },
      mutations: {
        retry: false,
        ...defaultOptions.mutations,
      },
    },
  };
}
