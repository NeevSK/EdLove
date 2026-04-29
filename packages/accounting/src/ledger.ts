import { supabase } from '@repo/core/api';;

import type { FinancialTransaction, LedgerEntry } from './types';

export class Ledger {
  /**
   * Records a full financial transaction with its ledger entries.
   * Ensures the double-entry balance before proceeding.
   */
  static async recordTransaction(
    transaction: Omit<FinancialTransaction, 'id' | 'entries'>,
    entries: Omit<LedgerEntry, 'id' | 'transactionId' | 'createdAt'>[],
  ) {
    // 1. Validate Double Entry Balance
    const total = entries.reduce((sum, entry) => {
      return entry.side === 'debit' ? sum + entry.amount : sum - entry.amount;
    }, 0);

    if (Math.abs(total) > 0.001) {
      throw new Error('Transaction is not balanced. Debits must equal Credits.');
    }

    // 2. Insert Transaction Header
    const { data: tx, error: txError } = await supabase
      .schema('accounting')
      .from('transactions')
      .insert(transaction)
      .select()
      .single();

    if (txError) throw txError;

    // 3. Insert Ledger Entries
    const entriesWithTxId = entries.map((e) => ({
      ...e,
      transaction_id: tx.id,
    }));

    const { error: entriesError } = await supabase
      .schema('accounting')
      .from('ledger_entries')
      .insert(entriesWithTxId);

    if (entriesError) throw entriesError;

    return tx;
  }

  /**
   * Fetches the current balance of an account.
   */
  static async getAccountBalance(accountId: string) {
    const { data, error } = await supabase
      .schema('accounting')
      .from('vw_account_balances')
      .select('balance')
      .eq('id', accountId)
      .single();

    if (error) throw error;
    return data.balance;
  }
}
