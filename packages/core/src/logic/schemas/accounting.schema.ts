import { z } from 'zod';
import { makeModelSchema } from '../generated/zod';

/**
 * AccountSchema - A leaf or branch in the chart of accounts.
 * Derived from ZenStack Account model.
 */
export const AccountSchema = makeModelSchema('Account');

/**
 * LedgerEntrySchema - A single debit or credit record.
 * Derived from ZenStack LedgerEntry model.
 */
export const LedgerEntrySchema = makeModelSchema('LedgerEntry');

/**
 * FinancialTransactionSchema - A complete economic event.
 * Derived from ZenStack FinancialTransaction model.
 */
export const FinancialTransactionSchema = makeModelSchema('FinancialTransaction');

/**
 * BudgetSchema - Planning for future cycles.
 * Derived from ZenStack Budget model.
 */
export const BudgetSchema = makeModelSchema('Budget');

export type Account = z.infer<typeof AccountSchema>;
export type LedgerEntry = z.infer<typeof LedgerEntrySchema>;
export type FinancialTransaction = z.infer<typeof FinancialTransactionSchema>;
export type Budget = z.infer<typeof BudgetSchema>;
