import { MutationOutcome } from './types';

export type ErrorCategory = 'TRANSIENT' | 'PERMANENT';

/**
 * classifyError
 *
 * Standardized mapping of PostgreSQL error codes and messages to
 * retry strategies.
 */
export function classifyError(error: any): ErrorCategory {
  const msg = error.message?.toLowerCase() || '';
  const code = error.code;

  // Permanent: Won't fix itself on retry (Auth, Schema, Logic, Constraints)
  // Reference: https://www.postgresql.org/docs/current/errcodes-appendix.html
  if (
    code === '23505' || // Unique violation
    code === '42501' || // Insufficient privilege
    code === '42P01' || // Relation doesn't exist
    code === '23503' || // Foreign key violation
    code === '42703' || // Undefined column
    msg.includes('invalid jwt') ||
    msg.includes('permission denied') ||
    msg.includes('not found')
  ) {
    return 'PERMANENT';
  }

  // Transient: Network, timeout, rate limit, server 5xx
  // Also captures code 'P0000' (Internal Error) or network timeouts
  return 'TRANSIENT';
}
