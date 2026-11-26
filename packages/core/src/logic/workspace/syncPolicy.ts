import { classifyFailure, isRetryable, retryDelayMs } from '@repo/core/logic/failure/classifyFailure';
/** Transient workspace sync failures are retried; unrecognised ones (defects) are not. */
export function isRetryableWorkspaceSyncError(error: unknown): boolean {
  const kind = classifyFailure(error);
  return kind !== null && isRetryable(kind);
}

export function shouldRetryWorkspaceSync(failureCount: number, error: unknown): boolean {
  return failureCount < 3 && isRetryableWorkspaceSyncError(error);
}

export function workspaceSyncRetryDelay(attemptIndex: number): number {
  return retryDelayMs(attemptIndex);
}
