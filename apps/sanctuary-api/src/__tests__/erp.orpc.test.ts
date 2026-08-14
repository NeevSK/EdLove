import './setup';
import { beforeEach, describe, expect, it } from 'vitest';
import { createTestORPCClient } from './orpc-client';
import { setMockActiveBond, setMockZenStackDbAvailable } from './setup';

describe('Sanctuary API: ERP via native oRPC', () => {
  const userId = '123e4567-e89b-12d3-a456-426614174000';
  const headers = { Authorization: `Bearer ${userId}` };

  beforeEach(() => {
    setMockZenStackDbAvailable(true);
    setMockActiveBond({
      id: 'bond-erp-admin',
      user_id: userId,
      entity_id: 'GLOBAL',
      entity_type: 'PLATFORM',
      capacity: 'admin',
      status: 'active',
    });
  });

  it('reads the canonical account collection through the server boundary', async () => {
    await expect(createTestORPCClient(headers).erp.getAccounts()).resolves.toEqual([]);
  });

  it('rejects an unbalanced ledger transaction before persistence', async () => {
    await expect(
      createTestORPCClient(headers).erp.recordTransaction({
        description: 'Unbalanced transaction',
        entries: [
          { accountId: '123e4567-e89b-12d3-a456-426614174001', amount: 100, side: 'debit' },
          { accountId: '123e4567-e89b-12d3-a456-426614174002', amount: 90, side: 'credit' },
        ],
      }),
    ).rejects.toMatchObject({ status: 400 });
  });
});
