/**
 * Hexagonal Tuition Port
 *
 * Grounded in monorepo substrate contracts:
 * - @repo/accounting: FinancialTransaction, LedgerEntry
 * - @repo/payments: PaymentIntent, PaymentStatus
 * - @repo/core/types/Perspective: CommercialPerspective
 */

import type { PaymentIntent } from '@repo/core/logic/schemas/payments.schema';
import type { CommercialPerspective } from '@repo/core/types/Perspective';

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

export interface FeeReceiptInput {
  feeId: string;
  studentName: string;
  amount: number;
  batchId: string;
  payerUserId: string;
  feeType?: string;
  grossAmount?: number;
  waiverAmount?: number;
  concessionType?: 'statutory_aswesuma' | 'sibling_discount' | 'universal_free' | 'none';
  waiverReason?: string;
}

export interface FeeReceiptResult {
  receiptNo: string;
  transaction: FinancialTransaction;
  paymentIntent?: PaymentIntent;
  status: 'settled' | 'queued_offline';
  timestamp: string;
  grossAmount?: number;
  waiverAmount?: number;
  netPayable?: number;
  concessionType?: 'statutory_aswesuma' | 'sibling_discount' | 'universal_free' | 'none';
  waiverReason?: string;
}

export interface TuitionBatchSummary {
  enrolledStudents: number;
  todayAttendancePercent: number;
  monthlyFeesPaidPercent: number;
  totalCollected: number;
  pendingCount: number;
}

/** Inbound Port Driving the Tuition Floor UI */
export interface ITuitionPort {
  getBatches(): Promise<CommercialPerspective[]>;
  issueReceipt(input: FeeReceiptInput): Promise<FeeReceiptResult>;
  getBatchSummary(batchId?: string): Promise<TuitionBatchSummary>;
}

/** Outbound Port for Durable Storage Persistence */
export interface ITuitionStoragePort {
  loadCachedBatches(): CommercialPerspective[] | null;
  saveCachedBatches(batches: CommercialPerspective[]): void;
  loadCachedReceipts(): FeeReceiptResult[];
  saveCachedReceipt(receipt: FeeReceiptResult): void;
}
