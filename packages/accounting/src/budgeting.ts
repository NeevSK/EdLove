import { supabase } from '@repo/core/native';

export class Budgeting {
  /**
   * Checks if an account has sufficient budget remaining.
   */
  static async getBudgetRemaining(accountId: string, date: Date = new Date()) {
    const isoDate = date.toISOString().split('T')[0];

    // 1. Get Budget Allocation
    const { data: budget, error: budgetError } = await supabase
      .schema('accounting')
      .from('budgets')
      .select('amount')
      .eq('account_id', accountId)
      .lte('period_start', isoDate)
      .gte('period_end', isoDate)
      .single();

    if (budgetError) return null; // No budget defined

    // 2. Get Actual Spent (Cumulative Balance for expense accounts is usually Debit)
    const { data: balanceData, error: balanceError } = await supabase
      .schema('accounting')
      .from('vw_account_balances')
      .select('balance')
      .eq('id', accountId)
      .single();

    if (balanceError) throw balanceError;

    return budget.amount - balanceData.balance;
  }
}
