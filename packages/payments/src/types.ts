export type PaymentStatus = 'pending' | 'succeeded' | 'failed' | 'refunded' | 'cancelled';

export interface PaymentIntent {
  id: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
  provider: string;
  clientSecret?: string;
  metadata?: Record<string, unknown>;
}

export interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account' | 'wallet' | 'qr';
  provider: string;
  lastFour?: string;
  expiry?: string;
  isDefault: boolean;
  metadata?: Record<string, unknown>;
}

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
