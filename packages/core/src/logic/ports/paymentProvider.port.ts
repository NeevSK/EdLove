import type { PaymentIntent, PaymentStatus } from '@repo/core/types/Payments';

/** A payment gateway (PayHere, Stripe, ...): implemented in @repo/payments/plugins. */
export interface PaymentProvider {
  id: string;
  name: string;
  initializePayment(
    amount: number,
    currency: string,
    metadata?: Record<string, unknown>,
  ): Promise<PaymentIntent>;
  verifyPayment(paymentIntentId: string): Promise<PaymentStatus>;
  getFeeEstimate(amount: number): number;
}
