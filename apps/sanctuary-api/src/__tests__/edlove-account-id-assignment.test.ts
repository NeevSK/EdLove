import { describe, expect, it, vi } from 'vitest';

import { assignEdloveAccountId } from '../core/identity/edloveAccountIdAssignment';

const canonicalAccountId = '01234567-89ab-4def-8123-456789abcdef';
const existingEdloveId = '01234567-89ab-8101-8000-010203040506';
const mintedEdloveId = '01234567-89ab-8101-8000-111213141516';

function createOptions(overrides: Partial<Parameters<typeof assignEdloveAccountId>[1]> = {}) {
  return {
    issuer: { issue: vi.fn(() => mintedEdloveId) },
    onUniqueCollision: vi.fn(),
    queryRows: vi.fn(),
    ...overrides,
  };
}

describe('EdLove account ID assignment', () => {
  it('writes only through the private server-owned database assignment seam', async () => {
    const queryRows = vi
      .fn()
      .mockResolvedValueOnce([{ edlove_id: null }])
      .mockResolvedValueOnce([{ edlove_id: mintedEdloveId }]);
    const options = createOptions({ queryRows });

    await expect(assignEdloveAccountId(canonicalAccountId, options)).resolves.toBe(mintedEdloveId);
    expect(queryRows).toHaveBeenNthCalledWith(
      2,
      expect.stringContaining('private.assign_edlove_account_id'),
      [canonicalAccountId, mintedEdloveId],
    );
    expect(queryRows.mock.calls[1]?.[0]).not.toContain('update public.users');
  });

  it('returns a concurrent winner without replacing its assigned value', async () => {
    const options = createOptions({
      queryRows: vi.fn().mockResolvedValue([{ edlove_id: existingEdloveId }]),
    });

    await expect(assignEdloveAccountId(canonicalAccountId, options)).resolves.toBe(
      existingEdloveId,
    );
    expect(options.issuer.issue).not.toHaveBeenCalled();
  });

  it('retries only a database-confirmed unique collision', async () => {
    const queryRows = vi
      .fn()
      .mockResolvedValueOnce([{ edlove_id: null }])
      .mockRejectedValueOnce({ code: '23505' })
      .mockResolvedValueOnce([{ edlove_id: mintedEdloveId }]);
    const issuer = {
      issue: vi.fn().mockReturnValueOnce(existingEdloveId).mockReturnValueOnce(mintedEdloveId),
    };
    const onUniqueCollision = vi.fn();

    await expect(
      assignEdloveAccountId(canonicalAccountId, { issuer, queryRows, onUniqueCollision }),
    ).resolves.toBe(mintedEdloveId);
    expect(onUniqueCollision).toHaveBeenCalledWith({ canonicalAccountId, attempt: 1 });
    expect(issuer.issue).toHaveBeenCalledTimes(2);
  });

  it('fails closed after the bounded collision budget', async () => {
    const options = createOptions({
      queryRows: vi
        .fn()
        .mockResolvedValueOnce([{ edlove_id: null }])
        .mockRejectedValue({ code: '23505' }),
    });

    await expect(assignEdloveAccountId(canonicalAccountId, options)).rejects.toMatchObject({
      code: 'EDLOVE_ACCOUNT_ID_COLLISION_EXHAUSTED',
    });
    expect(options.issuer.issue).toHaveBeenCalledTimes(3);
    expect(options.onUniqueCollision).toHaveBeenCalledTimes(3);
  });

  it('rejects missing or deleted accounts without exposing account state', async () => {
    const options = createOptions({ queryRows: vi.fn().mockResolvedValue([]) });

    await expect(assignEdloveAccountId(canonicalAccountId, options)).rejects.toMatchObject({
      code: 'EDLOVE_ACCOUNT_ID_ACCOUNT_NOT_ELIGIBLE',
    });
    expect(options.issuer.issue).not.toHaveBeenCalled();
  });

  it('rejects malformed canonical identifiers before minting or querying', async () => {
    const options = createOptions();

    await expect(assignEdloveAccountId('not-a-uuid', options)).rejects.toMatchObject({
      code: 'EDLOVE_ACCOUNT_ID_INVALID_CANONICAL_ID',
    });
    expect(options.issuer.issue).not.toHaveBeenCalled();
    expect(options.queryRows).not.toHaveBeenCalled();
  });
});
