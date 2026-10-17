/**
 * Backward compatibility facade for @repo/core/utils/effect.
 *
 * Re-exports core execution primitives and canonical retry policies.
 * Specialized layer compositions and domain tags should be imported from `@repo/core/effect/layers`
 * or `@repo/core/logic/ports/growth.tags`.
 */

export {
  fireAndForget,
  fireAndForgetEffect,
  fromSupabase,
  reportBestEffort,
  runEffect,
  tryPromise,
} from '../effect/index';
export {
  defaultRetryPolicy,
  retryPolicy,
  strictRetryPolicy,
} from '../effect/Schedules';
