/**
 * Backward compatibility facade for @repo/core/utils/effect.
 *
 * Re-exports core execution primitives and canonical retry policies.
 * Specialized layer compositions and domain tags should be imported from `@repo/core/effect/layers`
 * or `@repo/core/logic/ports/growth.tags`.
 */

export {
  defaultRetryPolicy,
  strictRetryPolicy,
  retryPolicy,
} from '../effect/Schedules';

export {
  tryPromise,
  fireAndForget,
  fireAndForgetEffect,
  reportBestEffort,
  runEffect,
  fromSupabase,
} from '../effect/index';
