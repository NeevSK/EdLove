import { normalizeError } from '@repo/core/logic/utils/errorNormalizer';
import { describe, expect, it } from 'vitest';

describe('API error sanitization', () => {
  it('does not expose unknown exception messages as public details', () => {
    const error = normalizeError(new Error('password=super-secret database connection string'));

    expect(error.details.status).toBe(500);
    expect(error.details.code).toBe('INTERNAL_SERVER_ERROR');
    expect(error.details.detail).toBe('An unexpected platform error occurred.');
    expect(error.details.detail).not.toContain('super-secret');
  });

  it('does not expose gateway exception messages as public details', () => {
    const error = normalizeError({ status: 502, message: 'upstream secret response' });

    expect(error.details.status).toBe(502);
    expect(error.details.detail).toBe('HTTP request failed with status 502.');
    expect(error.details.detail).not.toContain('secret');
  });
});
