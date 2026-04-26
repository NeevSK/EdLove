import { supabase } from '@repo/core';

export class ChequeManager {
  /**
   * Registers a new cheque in the system.
   */
  static async registerCheque(cheque: {
    cheque_no: string;
    bank_name: string;
    payee_name: string;
    amount: number;
    issue_date: string;
    metadata?: any;
  }) {
    const { data, error } = await supabase
      .schema('accounting')
      .from('cheques')
      .insert({
        ...cheque,
        status: 'pending',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Marks a cheque as cleared and triggers corresponding ledger entries.
   */
  static async clearCheque(id: string, clearedDate: string = new Date().toISOString()) {
    const { data, error } = await supabase
      .schema('accounting')
      .from('cheques')
      .update({
        status: 'cleared',
        cleared_date: clearedDate,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // In a real implementation, this would also trigger recordTransaction()
    // to move money from "Pending Cheques" to "Bank Account".

    return data;
  }
}
