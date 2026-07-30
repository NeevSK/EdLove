import { ZodError } from 'zod';
import { ErrorCategory, SovereignError } from '@repo/core/types/Errors';

/**
 * normalizeError: The Sovereign Sanitizer
 * --------------------------------------
 * Converts raw internal errors (Prisma, Zod, Supabase) into
 * structured SovereignErrors that respect the observation tier.
 */
export const normalizeError = (error: unknown, instanceId?: string): SovereignError => {
  // 1. If already a SovereignError, just pass through (or add instance ID)
  if (error instanceof SovereignError) {
    if (instanceId && !error.details.instance) {
      return new SovereignError({ ...error.details, instance: instanceId });
    }
    return error;
  }

  // 2. Handle Zod Validation Errors (Schema Leakage Prevention)
  if (error instanceof ZodError) {
    return SovereignError.validation(
      'One or more fields are invalid.',
      error.format(), // Full detail for Devs, sanitized by SovereignError constructor in Prod
    );
  }

  // 3. Handle Supabase / PostgREST Errors (RLS violations)
  if (error && typeof error === 'object' && 'code' in error) {
    const pgError = error as { code: string; message: string; hint?: string };

    // 42501 is PostgreSQL Insufficient Privilege (RLS)
    if (pgError.code === '42501') {
      return new SovereignError({
        title: 'Security Boundary Violated',
        detail: 'The database denied access to this record.',
        status: 403,
        category: ErrorCategory.AUTHORIZATION,
        code: 'RLS_VIOLATION',
        userMessage: 'You do not have access to this data.',
        devDetails: pgError,
        instance: instanceId,
      });
    }
  }

  // 4. Handle standard HTTP Exceptions (e.g. Hono HTTPException)
  if (error && typeof error === 'object' && 'status' in error) {
    const httpError = error as { status: number; message?: string };
    if (typeof httpError.status === 'number') {
      return new SovereignError({
        title: 'HTTP Gateway Exception',
        detail: httpError.message || `HTTP request failed with status ${httpError.status}`,
        status: httpError.status,
        category: ErrorCategory.NETWORK,
        code: `HTTP_${httpError.status}`,
        instance: instanceId,
      });
    }
  }

  // 4. Fallback for Unknown Errors
  return new SovereignError({
    title: 'Unexpected Platform Error',
    detail: error instanceof Error ? error.message : 'Unknown error occurred',
    status: 500,
    category: ErrorCategory.UNKNOWN,
    code: 'INTERNAL_SERVER_ERROR',
    devDetails: error,
    instance: instanceId,
  });
};
