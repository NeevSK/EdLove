import { makeModelSchema } from '@repo/schema';
import type { z } from 'zod';

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

/** Database rows (ZenStack models). The domain shapes live in types/; see AGENTS.md on contracts. */
export type AccountRow = z.infer<typeof AccountSchema>;
export type LedgerEntryRow = z.infer<typeof LedgerEntrySchema>;
export type FinancialTransactionRow = z.infer<typeof FinancialTransactionSchema>;
export type BudgetRow = z.infer<typeof BudgetSchema>;
