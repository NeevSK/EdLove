import './setup';
import { describe, expect, it } from 'vitest';
import { toORPCError } from '../core/orpcMiddleware';

// ZenStack's ORMError carries a `reason`; the policy client throws it for denied writes
// and for rows filtered out by read rules. Neither may surface as a 500.
const ormError = (reason: string) => Object.assign(new Error('orm'), { reason });

describe('policy client errors on the wire', () => {
  it('maps a policy rejection to FORBIDDEN', () => {
    expect(toORPCError(ormError('rejected-by-policy'), 'r1')).toMatchObject({
      code: 'FORBIDDEN',
      data: { code: 'FORBIDDEN', requestId: 'r1' },
    });
  });

  it('maps a row hidden by a read rule to NOT_FOUND', () => {
    expect(toORPCError(ormError('not-found'))).toMatchObject({ code: 'NOT_FOUND' });
  });

  it('keeps other database errors opaque', () => {
    expect(toORPCError(ormError('db-query-error'))).toMatchObject({
      code: 'INTERNAL_SERVER_ERROR',
    });
    expect(toORPCError(new Error('boom'))).toMatchObject({ code: 'INTERNAL_SERVER_ERROR' });
  });
});
