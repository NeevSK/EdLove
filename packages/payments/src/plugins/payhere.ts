import type { PaymentIntent, PaymentProvider, PaymentStatus } from '@/types';

export class PayHereProvider implements PaymentProvider {
  id = 'payhere';
  name = 'PayHere (Sri Lanka)';

  async initializePayment(
    amount: number,
    currency: string,
    metadata?: any,
  ): Promise<PaymentIntent> {
    // In a real implementation, this would call PayHere API to get a checkout URL or token.
    // For now, we return a mock intent.
    return {
      id: `ph_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      currency,
      status: 'pending',
      provider: this.id,
      metadata,
    };
  }

  async verifyPayment(_paymentIntentId: string): Promise<PaymentStatus> {
    // Real check against PayHere API or Webhook status.
    return 'succeeded';
  }

  getFeeEstimate(amount: number): number {
    // PayHere typically has ~2.6% - 3.3% + fixed fee for cards.
    // Helapay is usually lower or fixed.
    return amount * 0.03;
  }
}
