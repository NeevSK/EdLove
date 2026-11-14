import { ORPCError } from '@orpc/client';
import { describe, expect, it } from 'vitest';
import { classifyError } from '../errorClassifier';

describe('typed RPC replay failures', () => {
  it.each([
    ['UNAUTHORIZED', 'AUTH_EXPIRED'],
    ['FORBIDDEN', 'PERMANENT'],
    ['BAD_REQUEST', 'PERMANENT'],
    ['CONFLICT', 'CONFLICT'],
    ['SERVICE_UNAVAILABLE', 'TRANSIENT'],
  ] as const)('classifies %s without relying on provider message wording', (code, expected) => {
    expect(classifyError(new ORPCError(code))).toBe(expected);
  });
  it('retains PostgreSQL unique-constraint and network classifications', () => {
    expect(classifyError({ code: '23505' })).toBe('PERMANENT');
    expect(classifyError(new TypeError('synthetic-offline'))).toBe('TRANSIENT');
  });
});
