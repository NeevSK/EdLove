import { describe, expect, it, vi } from 'vitest';

import { backfillEdloveAccountIds } from '../core/identity/edloveAccountIdBackfill';

const firstAccountId = '01234567-89ab-4def-8123-456789abcdef';
const secondAccountId = '11234567-89ab-4def-8123-456789abcdef';
const thirdAccountId = '21234567-89ab-4def-8123-456789abcdef';
const fourthAccountId = '31234567-89ab-4def-8123-456789abcdef';

describe('EdLove account ID backfill', () => {
  it('uses stable canonical-ID keyset pagination and only selects eligible accounts', async () => {
    const queryRows = vi.fn().mockResolvedValue([{ id: firstAccountId }]);
    const assign = vi.fn().mockResolvedValue('01234567-89ab-8101-8000-010203040506');

    await expect(backfillEdloveAccountIds({ assign, queryRows })).resolves.toEqual({
      processedCount: 1,
      nextCursor: null,
    });
    expect(queryRows).toHaveBeenCalledWith(expect.stringContaining('id > $1::uuid'), [null, 26]);
    expect(queryRows.mock.calls[0]?.[0]).toContain('deleted_at is null');
    expect(queryRows.mock.calls[0]?.[0]).toContain('edlove_id is null');
    expect(queryRows.mock.calls[0]?.[0]).toContain('order by id asc');
    expect(assign).toHaveBeenCalledWith(firstAccountId);
  });

  it('returns a resume cursor only after a complete bounded page', async () => {
    const queryRows = vi
      .fn()
      .mockResolvedValue([
        { id: secondAccountId },
        { id: thirdAccountId },
        { id: fourthAccountId },
      ]);
    const assign = vi.fn().mockResolvedValue('01234567-89ab-8101-8000-010203040506');

    await expect(
      backfillEdloveAccountIds({ assign, queryRows, cursor: firstAccountId, batchSize: 2 }),
    ).resolves.toEqual({
      processedCount: 2,
      nextCursor: thirdAccountId,
    });
    expect(queryRows).toHaveBeenCalledWith(expect.any(String), [firstAccountId, 3]);
    expect(assign.mock.calls.map(([id]) => id)).toEqual([secondAccountId, thirdAccountId]);
  });

  it('fails without advancing a cursor when an assignment fails', async () => {
    const queryRows = vi.fn().mockResolvedValue([{ id: firstAccountId }, { id: secondAccountId }]);
    const assign = vi
      .fn()
      .mockResolvedValueOnce('01234567-89ab-8101-8000-010203040506')
      .mockRejectedValueOnce(new Error('database unavailable'));

    await expect(backfillEdloveAccountIds({ assign, queryRows })).rejects.toThrow(
      'database unavailable',
    );
    expect(assign).toHaveBeenCalledTimes(2);
  });

  it('rejects invalid cursors and batch sizes before querying', async () => {
    const queryRows = vi.fn();
    const assign = vi.fn();

    await expect(
      backfillEdloveAccountIds({ assign, queryRows, cursor: 'not-a-uuid' }),
    ).rejects.toMatchObject({ code: 'EDLOVE_ACCOUNT_ID_INVALID_CANONICAL_ID' });
    await expect(backfillEdloveAccountIds({ assign, queryRows, batchSize: 101 })).rejects.toThrow(
      'between 1 and 100',
    );
    expect(queryRows).not.toHaveBeenCalled();
    expect(assign).not.toHaveBeenCalled();
  });
});
