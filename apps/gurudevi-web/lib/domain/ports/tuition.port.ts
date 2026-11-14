/**
 * Hexagonal Tuition Port
 *
 * Contracts come from @repo/core: types/Accounting (FinancialTransaction, LedgerEntry),
 * types/Payments (PaymentIntent) and types/Perspective (CommercialPerspective).
 */

import type { FinancialTransaction } from '@repo/core/types/Accounting';
import type { PaymentIntent } from '@repo/core/types/Payments';
import type { CommercialPerspective } from '@repo/core/types/Perspective';

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
