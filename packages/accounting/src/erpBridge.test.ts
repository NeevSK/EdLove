import { describe, expect, it } from 'vitest';
import {
  convertAccrualInvoiceToTransaction,
  convertCashSettlementToTransaction,
  convertStockConsumptionToTransaction,
  DEFAULT_INSTITUTIONAL_COA,
} from './erpBridge';

describe('Accounting ERP Bridge', () => {
  it('converts an accrual invoice journal with statutory welfare into a balanced transaction', () => {
    const journal = {
      invoiceId: 'inv_123',
      assessmentDate: '2026-10-10T10:00:00Z',
      description: 'Accrual Fee Assessment for Term 1',
      netStudentReceivableCents: 200000,
      subsidyCoveredCents: 300000,
      entries: [
        {
          accountCode: '1200_STUDENT_AR',
          amountCents: 200000,
          side: 'debit' as const,
          description: 'Student AR',
        },
        {
          accountCode: '4200_STATUTORY_SUBSIDY',
          amountCents: 300000,
          side: 'debit' as const,
          description: 'Aswesuma Subsidy',
        },
        {
          accountCode: '4100_TUITION_REVENUE',
          amountCents: 500000,
          side: 'credit' as const,
          description: 'Gross Tuition Revenue',
        },
      ],
    };

    const { transaction, entries } = convertAccrualInvoiceToTransaction(journal);

    expect(transaction.referenceNo).toBe('inv_123');
    expect(entries).toHaveLength(3);

    const debitTotal = entries
      .filter((e) => e.side === 'debit')
      .reduce((sum, e) => sum + e.amount, 0);
    const creditTotal = entries
      .filter((e) => e.side === 'credit')
      .reduce((sum, e) => sum + e.amount, 0);

    expect(debitTotal).toBe(5000);
    expect(creditTotal).toBe(5000);
  });

  it('converts cash settlement into balanced cash vs AR clearing', () => {
    const journal = {
      settlementId: 'settle_1',
      invoiceId: 'inv_123',
      settledAt: '2026-10-10T11:00:00Z',
      payerUserId: 'parent_456',
      paymentMethod: 'cash' as const,
      amountSettledCents: 200000,
      entries: [
        {
          accountCode: '1100_CASH_BANK',
          amountCents: 200000,
          side: 'debit' as const,
          description: 'Cash received',
        },
        {
          accountCode: '1200_STUDENT_AR',
          amountCents: 200000,
          side: 'credit' as const,
          description: 'AR cleared',
        },
      ],
    };

    const { entries } = convertCashSettlementToTransaction(journal);
    expect(entries).toHaveLength(2);
    expect(entries[0]?.accountId).toBe(DEFAULT_INSTITUTIONAL_COA.cashBankAccountId);
    expect(entries[0]?.side).toBe('debit');
    expect(entries[0]?.amount).toBe(2000);

    expect(entries[1]?.accountId).toBe(DEFAULT_INSTITUTIONAL_COA.studentReceivablesAccountId);
    expect(entries[1]?.side).toBe('credit');
    expect(entries[1]?.amount).toBe(2000);
  });

  it('converts consumable stock consumption into balanced operational supplies expense', () => {
    const movement = {
      id: 'mov_999',
      assetItemId: 'item_rice',
      assetName: 'Samba Rice 50kg',
      totalCostCents: 1100000,
      relatedEventId: 'event_midday_meal',
    };

    const { entries } = convertStockConsumptionToTransaction(movement);
    expect(entries).toHaveLength(2);
    expect(entries[0]?.side).toBe('debit');
    expect(entries[0]?.amount).toBe(11000);
    expect(entries[1]?.side).toBe('credit');
    expect(entries[1]?.amount).toBe(11000);
  });
});
