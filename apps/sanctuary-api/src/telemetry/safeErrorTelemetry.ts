/**
 * Boundary-safe error data for logs and telemetry. Public problem details are
 * already normalized, but provider/ORM exceptions can still contain secrets.
 */
export function toSafeErrorTelemetry(error: unknown, code: string, status: number) {
  const category = error instanceof Error ? 'Error' : 'UnknownError';
  return {
    category,
    code,
    status,
    message: `request failed with ${code}`,
  };
}
