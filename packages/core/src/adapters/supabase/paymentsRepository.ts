import { APIError } from '@repo/core/types/API';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface PaymentTransactionRecord {
  id: string;
  amount: number;
  provider: string | null;
  external_id: string | null;
  status: string;
  metadata?: Record<string, unknown> | null;
}

export interface PaymentsRepository {
  getTransactionById(id: string): Promise<PaymentTransactionRecord | null>;
  finalizeTransaction(id: string, ledgerTransactionId: string): Promise<void>;
}

export const createSupabasePaymentsRepository = (supabase: SupabaseClient): PaymentsRepository => ({
  async getTransactionById(id: string): Promise<PaymentTransactionRecord | null> {
    const { data, error } = await supabase
      .schema('payments')
      .from('transactions')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw new APIError('Failed to fetch payment transaction', error.code, error);
    return data;
  },

  async finalizeTransaction(id: string, ledgerTransactionId: string): Promise<void> {
    const { error } = await supabase
      .schema('payments')
      .from('transactions')
      .update({
        status: 'succeeded',
        ledger_transaction_id: ledgerTransactionId,
      })
      .eq('id', id);

    if (error) throw new APIError('Failed to finalize payment transaction', error.code, error);
  },
});
