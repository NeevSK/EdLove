import type { PaymentIntent, PaymentProvider, PaymentStatus } from '@repo/payments/types';

export class PayHereProvider implements PaymentProvider {
  id = 'payhere';
  name = 'PayHere (Sri Lanka)';

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
        'PayHereProvider: Live payment processing must execute via server-side edge function webhook. Direct client initialization is prohibited in production.',
      );
    }

    const intentId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? `ph_demo_${crypto.randomUUID()}`
        : `ph_demo_${Date.now()}`;

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
        'PayHereProvider: Payment verification must query the official webhook status on the server edge.',
      );
    }

    return 'succeeded';
  }

  getFeeEstimate(amount: number): number {
    // PayHere typically has ~2.6% - 3.3% + fixed fee for cards.
    // Helapay is usually lower or fixed.
    return amount * 0.03;
  }
}
