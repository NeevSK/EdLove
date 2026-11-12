import { classifyFailure, isRetryable } from '@repo/core/logic/failure/classifyFailure';

/** HTTP transport status takes precedence over a custom application's error code. */
export function getAPIErrorStatus(error: unknown): number | undefined {
  if (typeof error !== 'object' || error === null) return undefined;
  if ('status' in error && typeof (error as any).status === 'number') {
    return (error as any).status;
  }
  if ('statusCode' in error && typeof (error as any).statusCode === 'number') {
    return (error as any).statusCode;
  }
  return undefined;
}

/** Unrecognised failures (defects) are retried, as before; known kinds follow RETRY_POLICY. */
export function shouldRetryAPIRequest(error: unknown): boolean {
  const kind = classifyFailure(error);
  return kind === null || isRetryable(kind);
}
