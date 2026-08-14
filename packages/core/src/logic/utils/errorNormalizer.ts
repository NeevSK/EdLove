import { ErrorCategory, SovereignError } from '@repo/core/types/Errors';
import { ZodError } from 'zod';

/**
 * normalizeError: The Sovereign Sanitizer
 * --------------------------------------
 * Converts raw internal errors (Prisma, Zod, Supabase) into
 * structured SovereignErrors that respect the observation tier.
 */
export const normalizeError = (error: unknown, instanceId?: string): SovereignError => {
  const attachInstance = (normalized: SovereignError): SovereignError => {
    if (instanceId && !normalized.details.instance) {
      return new SovereignError({ ...normalized.details, instance: instanceId });
    }
    return normalized;
  };

  // 1. If already a SovereignError, just pass through (or add instance ID)
  if (error instanceof SovereignError) {
    if (instanceId && !error.details.instance) {
      return new SovereignError({ ...error.details, instance: instanceId });
    }
    return error;
  }

  // 2. Handle Zod Validation Errors (Schema Leakage Prevention)
  if (error instanceof ZodError) {
    return attachInstance(
      SovereignError.validation(
        'One or more fields are invalid.',
        error.format(), // Full detail for Devs, sanitized by SovereignError constructor in Prod
      ),
    );
  }

  // Transitional classification for legacy handlers. New handlers should
  // throw SovereignError directly; this prevents old string errors from
  // becoming misleading HTTP 500 responses while the migration proceeds.
  if (error instanceof Error) {
    const message = error.message;
    if (/^Authentication required$|^Not authenticated$|^Unauthorized$/.test(message)) {
      return attachInstance(SovereignError.authenticationRequired());
    }
    if (/not found$/i.test(message) || /^Identity not found$/.test(message)) {
      return attachInstance(SovereignError.notFound());
    }
    if (/^Database context not (initialized|available)$/.test(message)) {
      return attachInstance(SovereignError.unavailable('DATABASE_UNAVAILABLE'));
    }
    if (/^RateLimitStoreUnavailable$/.test(message)) {
      return attachInstance(SovereignError.unavailable('RATE_LIMIT_STORE_UNAVAILABLE'));
    }
    if (/^PermissionSnapshotRequiresAuthenticatedUser$/.test(message)) {
      return attachInstance(SovereignError.authenticationRequired());
    }
    if (/^PermissionSnapshotRequiresActiveBond$/.test(message)) {
      return attachInstance(
        SovereignError.invalidInput('An active bond is required for this operation.'),
      );
    }
    if (/^PermissionSnapshotScopeNotFound$/.test(message)) {
      return attachInstance(SovereignError.notFound('Permission scope'));
    }
    if (/^SnapshotSigningKeyNotConfigured$|^PolicyVersionNotConfigured$/.test(message)) {
      return attachInstance(SovereignError.unavailable('AUTHORIZATION_CONFIGURATION_UNAVAILABLE'));
    }
    if (/^Model API key not configured/.test(message)) {
      return attachInstance(SovereignError.unavailable('AI_PROVIDER_UNAVAILABLE'));
    }
    if (/^Invalid encrypted text format$/.test(message)) {
      return attachInstance(SovereignError.invalidInput('The encrypted value is invalid.'));
    }
    if (
      /^Cannot create a conversation with yourself$|^Cannot block yourself$|^invalid cursor$/i.test(
        message,
      )
    ) {
      return attachInstance(SovereignError.invalidInput(message));
    }
    if (/^MissingActive(BondSelection|Capacity)$|^PrivilegeEscalation$/.test(message)) {
      return attachInstance(SovereignError.unauthorized('use', 'active scope'));
    }
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
      if (httpError.status === 401) return attachInstance(SovereignError.authenticationRequired());
      if (httpError.status === 404) return attachInstance(SovereignError.notFound());
      if (httpError.status === 429) return attachInstance(SovereignError.rateLimited());
      if (httpError.status === 503) return attachInstance(SovereignError.unavailable());
      return new SovereignError({
        title: 'HTTP Gateway Exception',
        detail: `HTTP request failed with status ${httpError.status}.`,
        status: httpError.status,
        category: httpError.status === 403 ? ErrorCategory.AUTHORIZATION : ErrorCategory.NETWORK,
        code: `HTTP_${httpError.status}`,
        instance: instanceId,
      });
    }
  }

  // 4. Fallback for Unknown Errors
  return new SovereignError({
    title: 'Unexpected Platform Error',
    detail: 'An unexpected platform error occurred.',
    status: 500,
    category: ErrorCategory.UNKNOWN,
    code: 'INTERNAL_SERVER_ERROR',
    devDetails: error,
    instance: instanceId,
  });
};
