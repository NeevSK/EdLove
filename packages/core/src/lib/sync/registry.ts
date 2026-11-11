import type { QueuedMutation, QueuedMutationDispatchResult } from '@repo/core/types/mutationQueue';

/**
 * The pre-cutover domain replay table was retired with the legacy API.
 * Domain modules must register their own admitted replay handlers when they
 * are migrated onto the v1 command boundary.
 */
export const MUTATION_REGISTRY: Record<
  string,
  (variables: unknown, context?: { idempotencyKey: string; commandId?: string; userId?: string }) =>
    Promise<QueuedMutationDispatchResult>
> = Object.create(null) as Record<
  string,
  (variables: unknown, context?: { idempotencyKey: string; commandId?: string; userId?: string }) =>
    Promise<QueuedMutationDispatchResult>
>;

export function hasAdmittedMutation(name: QueuedMutation['name']): boolean {
  return Object.prototype.hasOwnProperty.call(MUTATION_REGISTRY, name);
}
