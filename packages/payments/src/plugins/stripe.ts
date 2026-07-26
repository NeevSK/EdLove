import type { PaymentIntent, PaymentProvider, PaymentStatus } from '@/types';

export class StripeProvider implements PaymentProvider {
  id = 'stripe';
  name = 'Stripe (International)';

  async initializePayment(
    amount: number,
    currency: string,
    metadata?: any,
  ): Promise<PaymentIntent> {
    // In a real implementation, this would call Stripe API (via Edge Function)
    // to create a PaymentIntent and return the client_secret.
    return {
      id: `st_${Math.random().toString(36).substr(2, 9)}`,
      amount,
      currency,
      status: 'pending',
      provider: this.id,
      metadata,
    };
  }

  async verifyPayment(_paymentIntentId: string): Promise<PaymentStatus> {
    // Real check against Stripe API or Webhook status.
    return 'succeeded';
  }

  getFeeEstimate(amount: number): number {
    // Stripe International typically 2.9% + $0.30.
    return amount * 0.029 + 0.3;
  }
}
