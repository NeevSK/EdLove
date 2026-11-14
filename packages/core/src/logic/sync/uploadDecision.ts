import {
  type FailureKind,
  RETRY_POLICY,
  classifyFailure,
  isInterruption,
} from '@repo/core/logic/failure/classifyFailure';

/**
 * What the sync pipe does with one local change the server did not accept. The device may go
 * first, but the server has the last word (data stack mental model, section 5):
 *
 * - `Retry`: the change stays at the head of the upload queue and the SDK tries again after its
 *   retry delay. Transient failures, an expired session and a missing route all wait; nothing is
 *   lost while the person is offline for a day or a week.
 * - `Reject`: the server refused it for good. The change leaves the queue, the next download puts
 *   the server's copy back, and the person is told. A defect that keeps failing is rejected after
 *   `maxDefectAttempts`, so one bad change cannot block every change behind it.
 * - `Stop`: the SDK disconnected (sign-out, account switch); the change stays queued.
 */
export type UploadDecision =
  | { readonly _tag: 'Retry'; readonly reason: 'transient' | 'signIn' | 'conflict' }
  | { readonly _tag: 'Reject'; readonly reason: RejectReason }
  | { readonly _tag: 'Stop' };

export type RejectReason = 'forbidden' | 'notFound' | 'invalid' | 'conflict' | 'defect';

/** Upload limits and conflict handling, as a policy: change them here and the pipe follows. */
export const UPLOAD_POLICY = {
  /** `serverWins` drops the local change; `hold` keeps it queued until the conflict is resolved. */
  conflict: 'serverWins' as 'serverWins' | 'hold',
  /** Attempts before an unclassified failure (a bug) is rejected instead of blocking the queue. */
  maxDefectAttempts: 5,
};
export type UploadPolicy = typeof UPLOAD_POLICY;

const REJECT_REASON: Partial<Record<FailureKind['_tag'], RejectReason>> = {
  ForbiddenError: 'forbidden',
  NotFoundError: 'notFound',
  ValidationError: 'invalid',
  DatabaseQueryError: 'invalid',
};

export function decideUploadFailure(
  error: unknown,
  attempt: number,
  policy: UploadPolicy = UPLOAD_POLICY,
): UploadDecision {
  if (isInterruption(error)) return { _tag: 'Stop' };
  const kind = classifyFailure(error);
  if (!kind) {
    return attempt >= policy.maxDefectAttempts
      ? { _tag: 'Reject', reason: 'defect' }
      : { _tag: 'Retry', reason: 'transient' };
  }
  switch (kind._tag) {
    case 'UnauthorizedError':
      return { _tag: 'Retry', reason: 'signIn' };
    case 'ConflictError':
      return policy.conflict === 'hold'
        ? { _tag: 'Retry', reason: 'conflict' }
        : { _tag: 'Reject', reason: 'conflict' };
    case 'OfflineMutationError':
      return { _tag: 'Retry', reason: 'transient' };
  }
  if (RETRY_POLICY[kind._tag] !== 'never') return { _tag: 'Retry', reason: 'transient' };
  return { _tag: 'Reject', reason: REJECT_REASON[kind._tag] ?? 'invalid' };
}
