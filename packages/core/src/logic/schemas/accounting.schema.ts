import { z } from 'zod';

export const AccountTypeSchema = z.enum(['asset', 'liability', 'equity', 'income', 'expense']);

export const AccountSchema = z.object({
  id: z.string(),
  name: z.string(),
  code: z.string(),
  type: AccountTypeSchema,
  parentId: z.string().optional(),
  balance: z.number(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const LedgerEntrySchema = z.object({
  id: z.string(),
  transactionId: z.string(),
  accountId: z.string(),
  amount: z.number(),
  side: z.enum(['debit', 'credit']),
  description: z.string().optional(),
  createdAt: z.string(),
});

export const FinancialTransactionSchema = z.object({
  id: z.string(),
  date: z.string(),
  description: z.string(),
  referenceNo: z.string().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
  entries: z.array(LedgerEntrySchema),
});

export const BudgetSchema = z.object({
  id: z.string(),
  accountId: z.string(),
  amount: z.number(),
  periodStart: z.string(),
  periodEnd: z.string(),
  actualSpent: z.number(),
});
