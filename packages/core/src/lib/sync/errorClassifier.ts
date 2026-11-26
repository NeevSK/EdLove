import { classifyFailure } from '@repo/core/logic/failure/classifyFailure';

export type SyncFailureClass = 'TRANSIENT' | 'PERMANENT' | 'CONFLICT' | 'AUTH_EXPIRED';

/**
 * The outbox's view of a failure: how it should treat a queued item. The rules live in
 * logic/failure/classifyFailure.ts; this maps the kind onto the outbox's four classes.
 */
export function classifyError(error: unknown): SyncFailureClass {
  const kind = classifyFailure(error);
  switch (kind?._tag) {
    case 'UnauthorizedError':
      return 'AUTH_EXPIRED';
    case 'ForbiddenError':
    case 'NotFoundError':
    case 'ValidationError':
    case 'DatabaseQueryError':
      return 'PERMANENT';
    case 'ConflictError':
      return 'CONFLICT';
    default:
      // Transient kinds, and defects: the outbox keeps retrying what it can't recognise.
      return 'TRANSIENT';
  }
}
