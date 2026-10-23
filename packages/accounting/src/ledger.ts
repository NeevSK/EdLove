import { accountingAPI } from '@repo/core/api/erp';
import type { FinancialTransaction, LedgerEntry } from '@repo/accounting/types';

export class Ledger {
  /**
   * Records a full financial transaction with its ledger entries.
   * Ensures the double-entry balance before proceeding.
   */
  static async recordTransaction(
    transaction: Omit<FinancialTransaction, 'id' | 'entries'>,
    entries: Omit<LedgerEntry, 'id' | 'transactionId' | 'createdAt'>[],
  ): Promise<FinancialTransaction> {
    // 1. Validate Double Entry Balance
    const total = entries.reduce((sum, entry) => {
      return entry.side === 'debit' ? sum + entry.amount : sum - entry.amount;
    }, 0);

    if (Math.abs(total) > 0.001) {
      throw new Error('Transaction is not balanced. Debits must equal Credits.');
    }

    const isoDate = (transaction.date ? new Date(transaction.date) : new Date()).toISOString();

    // 2. Delegate to Server Contract via oRPC (enforcing atomic DB transaction and ZenStack policies)
    const tx = await accountingAPI.recordTransaction({
      date: isoDate,
      description: transaction.description,
      referenceNo: transaction.referenceNo ?? null,
      metadata: transaction.metadata ?? undefined,
      entries: entries.map((e) => ({
        accountId: e.accountId,
        amount: e.amount,
        side: e.side,
        description: e.description ?? null,
      })),
    });

    return {
      id: tx.id,
      date: tx.date instanceof Date ? tx.date.toISOString() : String(tx.date),
      description: tx.description,
      referenceNo: tx.reference_no ?? undefined,
      metadata: (tx.metadata as Record<string, any>) ?? undefined,
      entries: entries.map((e, index) => ({
        id: `${tx.id}_entry_${index}`,
        transactionId: tx.id,
        accountId: e.accountId,
        amount: e.amount,
        side: e.side,
        description: e.description ?? undefined,
        createdAt: new Date().toISOString(),
      })),
    };
  }

  /**
   * Fetches the current balance of an account.
   */
  static async getAccountBalance(accountId: string): Promise<number> {
    const accounts = await accountingAPI.getAccounts();
    const account = accounts.find((a: any) => a.id === accountId);
    return account ? Number(account.balance ?? 0) : 0;
  }
}
