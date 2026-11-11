/** Accounting domain contracts. Database rows are in logic/schemas/accounting.schema.ts (`*Row`). */

export type AccountType = 'asset' | 'liability' | 'equity' | 'income' | 'expense';

export interface Account {
  id: string;
  name: string;
  code: string;
  type: AccountType;
  parentId?: string;
  balance: number;
  metadata?: Record<string, unknown>;
}

export interface LedgerEntry {
  id: string;
  transactionId: string;
  accountId: string;
  amount: number;
  side: 'debit' | 'credit';
  description?: string;
  createdAt: string;
}

export interface FinancialTransaction {
  id: string;
  date: string;
  description: string;
  referenceNo?: string;
  metadata?: Record<string, unknown>;
  entries: LedgerEntry[];
}

export interface Budget {
  id: string;
  accountId: string;
  amount: number;
  periodStart: string;
  periodEnd: string;
  actualSpent: number;
}
