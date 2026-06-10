export type AccountType = 'asset' | 'liability' | 'equity' | 'income' | 'expense';

export interface Account {
  id: string;
  name: string;
  code: string;
  type: AccountType;
  parentId?: string;
  balance: number;
  metadata?: Record<string, any>;
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
  metadata?: Record<string, any>;
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
