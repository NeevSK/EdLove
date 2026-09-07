export type ErrorCategory = 'TRANSIENT' | 'PERMANENT' | 'CONFLICT' | 'AUTH_EXPIRED';

/**
 * classifyError
 *
 * Standardized mapping of PostgreSQL and HTTP error codes and messages to
 * retry strategies.
 */
export function classifyError(error: any): ErrorCategory {
  const msg = error.message?.toLowerCase() || '';
  const code = String(error.code || error.status || '');

  // Auth Expired: Token expired or needs refresh (should pause, not dump to DLQ)
  if (
    code === '401' ||
    msg.includes('jwt expired') ||
    msg.includes('token expired') ||
    msg.includes('refresh token')
  ) {
    return 'AUTH_EXPIRED';
  }

  // Permanent: Won't fix itself on retry (Schema, Logic, Constraints)
  // Reference: https://www.postgresql.org/docs/current/errcodes-appendix.html
  if (
    code === '23505' || // Unique violation
    code === '42501' || // Insufficient privilege
    code === '42P01' || // Relation doesn't exist
    code === '23503' || // Foreign key violation
    code === '42703' || // Undefined column
    msg.includes('permission denied') ||
    msg.includes('not found')
  ) {
    return 'PERMANENT';
  }

  // Conflict: Data fork detected (Version mismatch, 409 Conflict)
  if (
    code === '409' ||
    msg.includes('conflict') ||
    msg.includes('version mismatch') ||
    msg.includes('stale data')
  ) {
    return 'CONFLICT';
  }

  // Transient: Network, timeout, rate limit, server 5xx
  // Also captures code 'P0000' (Internal Error) or network timeouts
  return 'TRANSIENT';
}
