import { Ledger } from '@repo/accounting';
import { paymentsAPI } from '@repo/core/api/orchestration/erp';

import type { PaymentStatus } from '@repo/payments/types';

export class PaymentService {
  /**
   * Finalizes a payment and records it in the accounting ledger.
   */
  static async finalizePayment(
    paymentIntentId: string,
    status: PaymentStatus,
    accounts: { debit_account_id: string; credit_account_id: string },
  ) {
    if (status !== 'succeeded') return;

    // 1. Get Payment Details
    const payment = await paymentsAPI.getTransactionById(paymentIntentId);
    if (!payment) throw new Error(`Payment transaction ${paymentIntentId} not found`);

    // 2. Record in Ledger (Double Entry)
    const tx = await Ledger.recordTransaction(
      {
        date: new Date().toISOString().split('T')[0] ?? new Date().toISOString(),
        description: `Payment ${paymentIntentId} via ${payment.provider || 'unknown'}`,
        referenceNo: payment.external_id || undefined,
        metadata: { payment_id: paymentIntentId },
      },
      [
        {
          accountId: accounts.debit_account_id, // e.g., "Cash at Bank"
          amount: payment.amount,
          side: 'debit',
          description: 'Payment collection',
        },
        {
          accountId: accounts.credit_account_id, // e.g., "Student Fees Receivable" or "Sales Income"
          amount: payment.amount,
          side: 'credit',
          description: 'Fee settlement',
        },
      ],
    );

    // 3. Link back to Payment Transaction
    await paymentsAPI.finalizeTransaction(paymentIntentId, tx.id);
  }
}
