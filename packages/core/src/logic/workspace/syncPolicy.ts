/** Shared retry policy for transient workspace synchronization failures. */
export function isRetryableWorkspaceSyncError(error: unknown): boolean {
  if (!error || typeof error !== 'object') return false;

  const status = 'status' in error ? error.status : undefined;
  if (typeof status !== 'number') {
    const code = 'code' in error ? error.code : undefined;
    return (
      error instanceof TypeError ||
      code === 'ECONNRESET' ||
      code === 'ETIMEDOUT' ||
      code === 'ENOTFOUND' ||
      code === 'NETWORK_ERROR'
    );
  }
  return status === 408 || status === 429 || status >= 500;
}

export function shouldRetryWorkspaceSync(failureCount: number, error: unknown): boolean {
  return failureCount < 3 && isRetryableWorkspaceSyncError(error);
}

export function workspaceSyncRetryDelay(attemptIndex: number): number {
  const ceiling = Math.min(30_000, 1_000 * 2 ** attemptIndex);
  return Math.floor(Math.random() * ceiling);
}
