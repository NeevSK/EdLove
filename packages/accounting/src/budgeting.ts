import { accountingAPI } from '@repo/core/api/erp';

export class Budgeting {
  /**
   * Checks if an account has sufficient budget remaining.
   */
  static async getBudgetRemaining(accountId: string, _date: Date = new Date()): Promise<number | null> {
    try {
      const accounts = await accountingAPI.getAccounts();
      const account = accounts.find((a: any) => a.id === accountId);
      if (!account) return null;

      const metadata = (account.metadata as Record<string, any>) ?? {};
      const budgetAmount = Number(metadata.budget_amount ?? 0);
      if (budgetAmount <= 0) return null;

      const currentBalance = Number(account.balance ?? 0);
      return budgetAmount - currentBalance;
    } catch {
      return null;
    }
  }
}
