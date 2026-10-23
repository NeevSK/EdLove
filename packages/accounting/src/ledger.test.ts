import { describe, expect, it, vi, beforeEach } from 'vitest';
import { Ledger } from './ledger';
import { accountingAPI } from '@repo/core/api/erp';

vi.mock('@repo/core/api/erp', () => ({
  accountingAPI: {
    recordTransaction: vi.fn(),
    getAccounts: vi.fn(),
  },
}));

describe('Ledger (Decoupled Domain Service)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects an unbalanced financial transaction before sending to the API', async () => {
    await expect(
      Ledger.recordTransaction(
        {
          date: '2026-10-23T10:00:00Z',
          description: 'Unbalanced purchase',
        },
        [
          { accountId: 'acc_cash', amount: 100, side: 'credit' },
          { accountId: 'acc_expense', amount: 90, side: 'debit' }, // Missing 10
        ],
      ),
    ).rejects.toThrow('Transaction is not balanced. Debits must equal Credits.');

    expect(accountingAPI.recordTransaction).not.toHaveBeenCalled();
  });

  it('delegates balanced transactions to accountingAPI and returns mapped FinancialTransaction', async () => {
    const mockTx = {
      id: 'tx_abc123',
      date: new Date('2026-10-23T10:00:00Z'),
      description: 'Balanced fee payment',
      reference_no: 'REF-999',
      metadata: { term: 1 },
      created_at: new Date('2026-10-23T10:00:00Z'),
    };

    vi.mocked(accountingAPI.recordTransaction).mockResolvedValue(mockTx as any);

    const result = await Ledger.recordTransaction(
      {
        date: '2026-10-23T10:00:00Z',
        description: 'Balanced fee payment',
        referenceNo: 'REF-999',
        metadata: { term: 1 },
      },
      [
        { accountId: 'acc_bank', amount: 250, side: 'debit', description: 'Bank deposit' },
        { accountId: 'acc_tuition', amount: 250, side: 'credit', description: 'Tuition revenue' },
      ],
    );

    expect(accountingAPI.recordTransaction).toHaveBeenCalledWith({
      date: expect.any(String),
      description: 'Balanced fee payment',
      referenceNo: 'REF-999',
      metadata: { term: 1 },
      entries: [
        { accountId: 'acc_bank', amount: 250, side: 'debit', description: 'Bank deposit' },
        { accountId: 'acc_tuition', amount: 250, side: 'credit', description: 'Tuition revenue' },
      ],
    });

    expect(result.id).toBe('tx_abc123');
    expect(result.referenceNo).toBe('REF-999');
    expect(result.entries).toHaveLength(2);
    expect(result.entries[0]?.accountId).toBe('acc_bank');
    expect(result.entries[1]?.accountId).toBe('acc_tuition');
  });

  it('fetches account balance from accountingAPI.getAccounts', async () => {
    vi.mocked(accountingAPI.getAccounts).mockResolvedValue([
      { id: 'acc_bank', name: 'Bank', code: '1100', type: 'asset', balance: 15400 } as any,
      { id: 'acc_fees', name: 'Fees', code: '1200', type: 'asset', balance: 3200 } as any,
    ]);

    const balance = await Ledger.getAccountBalance('acc_bank');
    expect(balance).toBe(15400);

    const unknownBalance = await Ledger.getAccountBalance('acc_nonexistent');
    expect(unknownBalance).toBe(0);
  });
});
