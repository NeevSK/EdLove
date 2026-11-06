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

export function shouldRetryAPIRequest(error: unknown): boolean {
  const status = getAPIErrorStatus(error);
  if (!status) return true;
  return status >= 500 || status === 429;
}

