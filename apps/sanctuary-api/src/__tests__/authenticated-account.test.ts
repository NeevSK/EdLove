import { SovereignError } from '@repo/core/types/Errors';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { resolveAuthenticatedAccount } from '../core/authenticatedAccount';

const fixture = vi.hoisted(() => ({
  rows: [] as unknown,
  available: true,
  error: null as Error | null,
  query: vi.fn(),
}));
vi.mock('@repo/database/client', () => ({
  canUseZenStackDb: () => fixture.available,
  queryDatabaseRows: fixture.query,
}));

describe('authenticated account lookup (database substituted)', () => {
  const id = '01234567-89ab-8101-8000-010203040506';
  beforeEach(() => {
    fixture.available = true;
    fixture.rows = [{ user_id: id }];
    fixture.error = null;
    fixture.query.mockReset().mockImplementation(async () => {
      if (fixture.error) throw fixture.error;
      return fixture.rows;
    });
  });

  it('uses only a parameterized subject and the fixed provider, not contact details', async () => {
    const subject = "provider-subject'; SELECT private_data";
    await expect(resolveAuthenticatedAccount(subject, 'test-database-url')).resolves.toEqual({
      id,
    });
    expect(fixture.query).toHaveBeenCalledWith(expect.any(String), [subject], 'test-database-url');
    const sql = String(fixture.query.mock.calls[0]?.[0]);
    expect(sql).not.toContain(subject);
    expect(sql).not.toContain('email');
    expect(sql).not.toContain('phone');
    expect(sql).toContain('account.deleted_at IS NULL');
  });

  it.each([null, {}, '', 42])(
    'rejects malformed verified subject %j before querying',
    async (subject) => {
      await expect(resolveAuthenticatedAccount(subject)).rejects.toMatchObject({
        details: { status: 401 },
      });
      expect(fixture.query).not.toHaveBeenCalled();
    },
  );

  it('does not query without a database configuration', async () => {
    fixture.available = false;
    await expect(resolveAuthenticatedAccount('subject')).rejects.toMatchObject({
      details: { status: 503 },
    });
    expect(fixture.query).not.toHaveBeenCalled();
  });

  it('rejects an absent mapping', async () => {
    fixture.rows = [];
    await expect(resolveAuthenticatedAccount('subject')).rejects.toMatchObject({
      details: { status: 401 },
    });
  });

  it.each([[{ user_id: 'invalid' }], [{ user_id: id }, { user_id: id }], null])(
    'fails closed for corrupt or ambiguous mapping rows: %j',
    async (rows) => {
      fixture.rows = rows;
      await expect(resolveAuthenticatedAccount('subject')).rejects.toMatchObject({
        details: { status: 503 },
      });
    },
  );

  it.each([
    '123e4567-e89b-42d3-a456-426614174020',
    '01234567-89ab-8201-8000-010203040506',
    '01234567-89ab-8102-8000-010203040506',
    '01234567-89ab-8101-bf00-010203040506',
  ])('rejects a valid UUID outside the canonical account profile: %s', async (userId) => {
    fixture.rows = [{ user_id: userId }];
    await expect(resolveAuthenticatedAccount('subject')).rejects.toMatchObject({
      details: { status: 503, code: 'CANONICAL_ACCOUNT_ID_INVARIANT_VIOLATION' },
    });
  });

  it('does not retain provider exception details in the dependency error', async () => {
    fixture.error = new Error('synthetic-private-password');
    try {
      await resolveAuthenticatedAccount('subject');
      throw new Error('Expected lookup rejection');
    } catch (error) {
      expect(error).toBeInstanceOf(SovereignError);
      expect(error).toMatchObject({
        details: { status: 503, code: 'IDENTITY_RESOLUTION_UNAVAILABLE' },
      });
      expect(String(error)).not.toContain('synthetic-private-password');
      expect(JSON.stringify(error)).not.toContain('synthetic-private-password');
    }
  });
});
