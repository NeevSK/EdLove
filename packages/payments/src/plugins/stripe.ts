import type { PaymentIntent, PaymentProvider, PaymentStatus } from '@repo/payments/types';

export class StripeProvider implements PaymentProvider {
  id = 'stripe';
  name = 'Stripe (International)';

  async initializePayment(
    amount: number,
    currency: string,
    metadata?: Record<string, unknown>,
  ): Promise<PaymentIntent> {
    const isDevOrTest =
      process.env.NODE_ENV !== 'production' ||
      process.env.EDLOVE_DEMO === '1' ||
      metadata?.demo === true;

    if (!isDevOrTest) {
      throw new Error(
        'StripeProvider: Live payment processing must execute via server-side edge function webhook. Direct client initialization is prohibited in production.',
      );
    }

    const intentId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? `st_demo_${crypto.randomUUID()}`
        : `st_demo_${Date.now()}`;

    return {
      id: intentId,
      amount,
      currency,
      status: 'pending',
      provider: this.id,
      metadata,
    };
  }

  async verifyPayment(_paymentIntentId: string): Promise<PaymentStatus> {
    const isDevOrTest =
      process.env.NODE_ENV !== 'production' || process.env.EDLOVE_DEMO === '1';

    if (!isDevOrTest) {
      throw new Error(
        'StripeProvider: Payment verification must query the official webhook status on the server edge.',
      );
    }

    return 'succeeded';
  }

  getFeeEstimate(amount: number): number {
    // Stripe International typically 2.9% + $0.30.
    return amount * 0.029 + 0.3;
  }
}
