import { ORPCError } from '@orpc/client';
import { describe, expect, it } from 'vitest';
import { normalizeError } from './errorNormalizer';

describe('oRPC v2 errors outside procedure dispatch', () => {
  it.each([
    ['UNAUTHORIZED', 401],
    ['FORBIDDEN', 403],
    ['NOT_FOUND', 404],
    ['CONFLICT', 409],
    ['TOO_MANY_REQUESTS', 429],
    ['SERVICE_UNAVAILABLE', 503],
  ] as const)('preserves %s as HTTP %i without a legacy status property', (code, status) => {
    const error = new ORPCError(code, {
      message: 'private upstream detail',
      cause: new Error('password=private-value'),
    });
    expect('status' in error).toBe(false);
    const normalized = normalizeError(error, 'request-1');
    expect(normalized.details).toMatchObject({ status, code, instance: 'request-1' });
    expect(JSON.stringify(normalized.details)).not.toContain('private');
  });
});
