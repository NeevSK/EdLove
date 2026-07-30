import type { PaymentProvider } from '@repo/payments/types';

export class PaymentRegistry {
  private providers: Map<string, PaymentProvider> = new Map();

  register(provider: PaymentProvider) {
    this.providers.set(provider.id, provider);
  }

  getProvider(id: string): PaymentProvider | undefined {
    return this.providers.get(id);
  }

  getAllProviders(): PaymentProvider[] {
    return Array.from(this.providers.values());
  }

  getCheapestProvider(amount: number): PaymentProvider | undefined {
    let cheapest: PaymentProvider | undefined;
    let minFee = Infinity;

    for (const provider of this.providers.values()) {
      const fee = provider.getFeeEstimate(amount);
      if (fee < minFee) {
        minFee = fee;
        cheapest = provider;
      }
    }

    return cheapest;
  }
}

export const payments = new PaymentRegistry();
